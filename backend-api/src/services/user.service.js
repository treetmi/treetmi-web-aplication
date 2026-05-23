const prisma = require('../config/prisma');
const emailService = require('./email.service');

/**
 * Service for User/Streamer management with Passwordless OTP authentication
 */
class UserService {
  async register(data) {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    // Explicitly check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });
    if (existingUser) {
      throw new Error("Username sudah digunakan oleh kreator lain.");
    }

    // Explicitly check if email is already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existingEmail) {
      throw new Error("Alamat email sudah terdaftar. Silakan langsung masuk.");
    }

    let finalAvatarUrl = data.avatar_url || null;

    if (!finalAvatarUrl) {
      try {
        const avatarsCount = await prisma.avatar.count();
        if (avatarsCount > 0) {
          const skip = Math.floor(Math.random() * avatarsCount);
          const randomAvatar = await prisma.avatar.findFirst({
            skip: skip
          });
          if (randomAvatar) {
            finalAvatarUrl = randomAvatar.url;
          }
        }
      } catch (err) {
        console.error("Error picking random avatar during registration:", err);
      }

      // Final fallback if DB query failed or returned empty
      if (!finalAvatarUrl) {
        finalAvatarUrl = `/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.svg`;
      }
    }

    // Generate a 6-digit numerical OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        avatar_url: finalAvatarUrl,
        email_verified: false, // Unverified until OTP is successfully submitted
        otp_code: otp,
        otp_expires: expiry
      }
    });

    // Fire off the verification email containing the OTP
    await emailService.sendOTP(newUser.email, otp);

    return newUser;
  }

  async loginRequest(emailOrUsername) {
    const user = await this.findByEmailOrUsername(emailOrUsername);
    if (!user) {
      throw new Error("Akun dengan Email/Username tersebut tidak ditemukan.");
    }

    // Generate a new 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        otp_code: otp,
        otp_expires: expiry
      }
    });

    // Send verification email/OTP
    await emailService.sendOTP(updatedUser.email, otp);

    return updatedUser;
  }

  async verifyOTP(emailOrUsername, otp) {
    const user = await this.findByEmailOrUsername(emailOrUsername);
    if (!user) {
      throw new Error("Akun tidak ditemukan.");
    }

    if (!user.otp_code || user.otp_code !== otp.trim()) {
      throw new Error("Kode OTP yang Anda masukkan salah.");
    }

    if (new Date() > new Date(user.otp_expires)) {
      throw new Error("Kode OTP telah kedaluwarsa. Silakan minta kode baru.");
    }

    // OTP is valid! Clear the OTP variables and mark account verified in PostgreSQL
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        otp_code: null,
        otp_expires: null
      },
      include: {
        game_packages: {
          where: { status: 'ACTIVE' }
        },
        bank_account: true
      }
    });

    return verifiedUser;
  }

  async findByUsername(username) {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        game_packages: true,
        bank_account: true,
        project_assets: true,
        widget_setting: true,
        creator_media_setting: true,
        gacha_setting: true,
        gacha_wheel_items: {
          orderBy: { createdAt: 'asc' }
        },
        gacha_logs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        soundboard_items: {
          where: { is_active: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (user) {
      // Fetch active queues (WAITING, PLAYING)
      const queues = await prisma.mabarQueue.findMany({
        where: {
          transaction: {
            streamer_id: user.id
          },
          status: {
            in: ['WAITING', 'PLAYING']
          }
        },
        include: {
          transaction: true,
          game_package: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      user.mabar_queues = queues;

      // Calculate total successful transactions for donation target progress
      const aggregate = await prisma.transaction.aggregate({
        where: {
          streamer_id: user.id,
          status: 'SUCCESS'
        },
        _sum: {
          gross_amount: true
        }
      });
      user.target_collected = parseFloat(aggregate._sum.gross_amount) || 0;

      // Calculate unique supporters count (unique donors based on sender_name)
      const uniqueDonors = await prisma.transaction.groupBy({
        by: ['sender_name'],
        where: {
          streamer_id: user.id,
          status: 'SUCCESS'
        }
      });
      user.unique_supporters = uniqueDonors.length;

      // Fetch dynamic trust badges
      const trustBadges = await prisma.trustBadge.findMany({
        orderBy: { min_supporters: 'desc' }
      });
      const matchingBadge = trustBadges.find(
        b => user.unique_supporters >= b.min_supporters
      );
      user.trust_badge = matchingBadge || null;

      // Fetch successful transactions with messages (Reviews)
      const reviews = await prisma.transaction.findMany({
        where: {
          streamer_id: user.id,
          status: 'SUCCESS',
          message: {
            not: null,
            not: ''
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });
      user.reviews = reviews;

      // 1. Top Sultans All Time
      const topSultansAllTime = await prisma.transaction.groupBy({
        by: ['sender_name'],
        where: {
          streamer_id: user.id,
          status: 'SUCCESS'
        },
        _sum: {
          gross_amount: true
        },
        orderBy: {
          _sum: {
            gross_amount: 'desc'
          }
        },
        take: 10
      });
      user.top_supporters_all_time = topSultansAllTime.map(item => ({
        sender_name: item.sender_name,
        gross_amount: parseFloat(item._sum.gross_amount) || 0
      }));

      // 2. Top Sultans This Month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const topSultansMonth = await prisma.transaction.groupBy({
        by: ['sender_name'],
        where: {
          streamer_id: user.id,
          status: 'SUCCESS',
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          gross_amount: true
        },
        orderBy: {
          _sum: {
            gross_amount: 'desc'
          }
        },
        take: 10
      });
      user.top_supporters_month = topSultansMonth.map(item => ({
        sender_name: item.sender_name,
        gross_amount: parseFloat(item._sum.gross_amount) || 0
      }));

      // 3. Recent Donations (Last 5)
      const recentDonations = await prisma.transaction.findMany({
        where: {
          streamer_id: user.id,
          status: 'SUCCESS'
        },
        select: {
          id: true,
          sender_name: true,
          gross_amount: true,
          message: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      user.recent_donations = recentDonations.map(item => ({
        id: item.id,
        sender_name: item.sender_name,
        gross_amount: parseFloat(item.gross_amount) || 0,
        message: item.message,
        createdAt: item.createdAt
      }));

      let avatar = user.avatar_url;
      if (!avatar || avatar.includes('unsplash.com')) {
        let sum = 0;
        for (let i = 0; i < user.username.length; i++) {
          sum += user.username.charCodeAt(i);
        }
        avatar = `/avatars/avatar-${(sum % 8) + 1}.svg`;
      }
      user.avatar_url = avatar;
    }

    return user;
  }

  async findByEmailOrUsername(identifier) {
    const clean = identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: clean },
          { username: clean }
        ]
      },
      include: {
        game_packages: true,
        bank_account: true,
        project_assets: true
      }
    });

    if (user) {
      let avatar = user.avatar_url;
      if (!avatar || avatar.includes('unsplash.com')) {
        let sum = 0;
        for (let i = 0; i < user.username.length; i++) {
          sum += user.username.charCodeAt(i);
        }
        avatar = `/avatars/avatar-${(sum % 8) + 1}.svg`;
      }
      user.avatar_url = avatar;

      // Add unique_supporters and trust_badge for authenticated user lookup as well
      const uniqueDonors = await prisma.transaction.groupBy({
        by: ['sender_name'],
        where: {
          streamer_id: user.id,
          status: 'SUCCESS'
        }
      });
      user.unique_supporters = uniqueDonors.length;

      const trustBadges = await prisma.trustBadge.findMany({
        orderBy: { min_supporters: 'desc' }
      });
      const matchingBadge = trustBadges.find(
        b => user.unique_supporters >= b.min_supporters
      );
      user.trust_badge = matchingBadge || null;
    }

    return user;
  }

  async updateProfile(userId, data) {
    const updateData = {};
    
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl || null;
    if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url || null;
    if (data.bannerUrl !== undefined) updateData.banner_url = data.bannerUrl || null;
    if (data.banner_url !== undefined) updateData.banner_url = data.banner_url || null;
    
    if (data.bio !== undefined) updateData.bio = data.bio || null;
    
    if (data.youtubeUrl !== undefined) updateData.youtube_url = data.youtubeUrl || null;
    if (data.youtube_url !== undefined) updateData.youtube_url = data.youtube_url || null;
    if (data.discordUrl !== undefined) updateData.discord_url = data.discordUrl || null;
    if (data.discord_url !== undefined) updateData.discord_url = data.discord_url || null;
    
    if (data.facebookUrl !== undefined) updateData.facebook_url = data.facebookUrl || null;
    if (data.facebook_url !== undefined) updateData.facebook_url = data.facebook_url || null;
    if (data.twitchUrl !== undefined) updateData.twitch_url = data.twitchUrl || null;
    if (data.twitch_url !== undefined) updateData.twitch_url = data.twitch_url || null;
    if (data.tiktokUrl !== undefined) updateData.tiktok_url = data.tiktokUrl || null;
    if (data.tiktok_url !== undefined) updateData.tiktok_url = data.tiktok_url || null;
    if (data.instagramUrl !== undefined) updateData.instagram_url = data.instagramUrl || null;
    if (data.instagram_url !== undefined) updateData.instagram_url = data.instagram_url || null;
    if (data.websiteUrl !== undefined) updateData.website_url = data.websiteUrl || null;
    if (data.website_url !== undefined) updateData.website_url = data.website_url || null;
    
    if (data.is_live !== undefined) updateData.is_live = Boolean(data.is_live);
    if (data.role_title !== undefined) updateData.role_title = data.role_title;
    
    // Custom settings and toggles
    if (data.target_title !== undefined) updateData.target_title = data.target_title || null;
    if (data.target_amount !== undefined) updateData.target_amount = data.target_amount ? Number(data.target_amount) : null;
    if (data.show_target !== undefined) updateData.show_target = Boolean(data.show_target);
    if (data.show_queue !== undefined) updateData.show_queue = Boolean(data.show_queue);
    if (data.show_reviews !== undefined) updateData.show_reviews = Boolean(data.show_reviews);
    if (data.show_calendar !== undefined) updateData.show_calendar = Boolean(data.show_calendar);
    if (data.show_services !== undefined) updateData.show_services = Boolean(data.show_services);
    if (data.schedule_title !== undefined) updateData.schedule_title = data.schedule_title || null;
    
    // Custom CTA Buttons Text (Updated Schema with show_services toggle)
    if (data.service_btn_title !== undefined) updateData.service_btn_title = data.service_btn_title || null;
    if (data.service_btn_subtitle !== undefined) updateData.service_btn_subtitle = data.service_btn_subtitle || null;
    if (data.support_btn_title !== undefined) updateData.support_btn_title = data.support_btn_title || null;
    if (data.support_btn_subtitle !== undefined) updateData.support_btn_subtitle = data.support_btn_subtitle || null;
    
    // Mabar promotion settings
    if (data.mabar_promo_buy !== undefined) updateData.mabar_promo_buy = data.mabar_promo_buy ? parseInt(data.mabar_promo_buy, 10) : 0;
    if (data.mabar_promo_get !== undefined) updateData.mabar_promo_get = data.mabar_promo_get ? parseInt(data.mabar_promo_get, 10) : 0;
    
    return await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  async resetWidgetToken(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        widget_token: require('crypto').randomUUID()
      }
    });
  }

  async googleAuth(data) {
    console.log('🌱 [googleAuth] Received data from NextAuth:', data);
    const { email, name, avatarUrl } = data;
    
    // Check if user already exists by email
    let user = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase() },
      include: {
        game_packages: {
          where: { status: 'ACTIVE' }
        },
        bank_account: true
      }
    });

    if (user) {
      let avatar = user.avatar_url;
      
      // Persist actual Google avatarUrl if we got one and current is local, unsplash, or empty
      if (avatarUrl && (!avatar || avatar.includes('unsplash.com') || avatar.startsWith('/avatars/'))) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar_url: avatarUrl, email_verified: true },
          include: {
            game_packages: {
              where: { status: 'ACTIVE' }
            },
            bank_account: true
          }
        });
        avatar = avatarUrl;
        console.log('✅ [googleAuth] Successfully updated existing user avatar with Google avatar:', avatarUrl);
      } else {
        // Calculate dynamic avatar fallback if unsplash or null
        if (!avatar || avatar.includes('unsplash.com')) {
          let sum = 0;
          for (let i = 0; i < user.username.length; i++) {
            sum += user.username.charCodeAt(i);
          }
          avatar = `/avatars/avatar-${(sum % 8) + 1}.svg`;
          
          user = await prisma.user.update({
            where: { id: user.id },
            data: { avatar_url: avatar, email_verified: true },
            include: {
              game_packages: {
                where: { status: 'ACTIVE' }
              },
              bank_account: true
            }
          });
          console.log('✅ [googleAuth] Successfully updated existing user with default avatar fallback:', avatar);
        } else if (!user.email_verified) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { email_verified: true },
            include: {
              game_packages: {
                where: { status: 'ACTIVE' }
              },
              bank_account: true
            }
          });
        }
      }
      
      user.avatar_url = avatar;
      return { user };
    }

    // If new user, create their profile dynamically
    // 1. Generate a unique username from their email prefix
    let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Fallback if email prefix is blank
    if (!baseUsername) {
      baseUsername = 'creator';
    }

    // Check uniqueness
    let username = baseUsername;
    let counter = 1;
    while (true) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      if (!existingUser) break;
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // 2. Select a random avatar from the Master database
    let finalAvatarUrl = avatarUrl || null;
    if (!finalAvatarUrl) {
      try {
        const avatarsCount = await prisma.avatar.count();
        if (avatarsCount > 0) {
          const skip = Math.floor(Math.random() * avatarsCount);
          const randomAvatar = await prisma.avatar.findFirst({
            skip: skip
          });
          if (randomAvatar) {
            finalAvatarUrl = randomAvatar.url;
          }
        }
      } catch (err) {
        console.error("Error picking random avatar during Google registration:", err);
      }

      if (!finalAvatarUrl) {
        finalAvatarUrl = `/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.svg`;
      }
    }

    // 3. Create the user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email.trim().toLowerCase(),
        avatar_url: finalAvatarUrl,
        role_title: "STREAMER & KREATOR",
        email_verified: true // Automatically verified by Google OAuth!
      },
      include: {
        game_packages: true,
        bank_account: true
      }
    });

    return { user: newUser };
  }
}

module.exports = new UserService();
