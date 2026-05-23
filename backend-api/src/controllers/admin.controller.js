const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { hashPassword, verifyPassword } = require('../config/admin-auth');
const filterService = require('../services/filter.service');
const { resolveMediaUrl } = require('../utils/mediaResolver');

/**
 * 1. Fetch All Creators (Users)
 */
async function getAllCreators(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { user_reports: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert decimal numbers to floats and map default avatars deterministically
    const formatted = users.map(u => {
      let avatar = u.avatar_url;
      if (!avatar || avatar.includes('unsplash.com')) {
        let sum = 0;
        for (let i = 0; i < u.username.length; i++) {
          sum += u.username.charCodeAt(i);
        }
        avatar = `/avatars/avatar-${(sum % 8) + 1}.svg`;
      }

      return {
        ...u,
        avatar_url: avatar,
        balance: parseFloat(u.balance),
        isVerified: u.is_verified,
        status: u.status,
        reportCount: u._count?.user_reports || 0
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error('Error fetching admin creators:', err);
    res.status(500).json({ success: false, message: 'Server error fetching creators.' });
  }
}

/**
 * 2. Update Creator details (Edit Creator)
 */
async function updateCreator(req, res) {
  const { id } = req.params;
  const { username, email, balance, is_live, avatarUrl, roleTitle, isVerified, status } = req.body;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found.' });
    }

    // Server-side validation: Profile Photo must not exceed 500KB
    if (avatarUrl && avatarUrl.startsWith("data:")) {
      const approxBytes = (avatarUrl.length * 3) / 4;
      if (approxBytes > 500 * 1024) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ukuran foto profil tidak boleh melebihi 500 KB.' 
        });
      }
    }

    // Automatically convert Base64 avatar to Cloudflare R2 URL if configured
    let finalAvatar = user.avatar_url;
    if (avatarUrl !== undefined) {
      finalAvatar = await processBase64Upload(avatarUrl, username || user.username, 'avatar', 'avatars');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        username: username || user.username,
        email: email || user.email,
        balance: balance !== undefined ? parseFloat(balance) : user.balance,
        is_live: is_live !== undefined ? is_live : user.is_live,
        avatar_url: finalAvatar,
        role_title: roleTitle !== undefined ? roleTitle : user.role_title,
        is_verified: isVerified !== undefined ? isVerified : user.is_verified,
        status: status !== undefined ? status : user.status
      }
    });

    res.status(200).json({
      success: true,
      message: 'Creator details updated successfully.',
      data: { 
        ...updated, 
        balance: parseFloat(updated.balance),
        isVerified: updated.is_verified,
        status: updated.status
      }
    });
  } catch (err) {
    console.error('Error updating creator:', err);
    res.status(500).json({ success: false, message: 'Server error updating creator.' });
  }
}

/**
 * 3. Fetch All Withdrawals
 */
async function getAllWithdrawals(req, res) {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      include: {
        streamer: {
          select: {
            username: true,
            avatar_url: true,
            bank_account: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the withdrawals to match frontend requirements
    const formatted = withdrawals.map(w => {
      let avatar = w.streamer.avatar_url;
      if (!avatar || avatar.includes('unsplash.com')) {
        let sum = 0;
        for (let i = 0; i < w.streamer.username.length; i++) {
          sum += w.streamer.username.charCodeAt(i);
        }
        avatar = `/avatars/avatar-${(sum % 8) + 1}.svg`;
      }

      return {
        id: w.id,
        creator: w.streamer.username,
        creator_avatar: avatar,
        bankName: w.streamer.bank_account?.bank_name || 'GOPAY',
        accountNo: w.streamer.bank_account?.account_number || '08123456789',
        holder: w.streamer.bank_account?.account_holder_name || w.streamer.username,
        amount: parseFloat(w.amount_requested),
        status: w.status,
        date: new Date(w.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error('Error fetching admin withdrawals:', err);
    res.status(500).json({ success: false, message: 'Server error fetching withdrawals.' });
  }
}

/**
 * 4. Approve Withdrawal request
 */
async function approveWithdrawal(req, res) {
  const { id } = req.params;

  try {
    const wd = await prisma.withdrawal.findUnique({
      where: { id },
      include: { streamer: true }
    });

    if (!wd) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
    }

    if (wd.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Withdrawal request is already processed.' });
    }

    // Update status to SUCCESS in DB
    const updated = await prisma.withdrawal.update({
      where: { id },
      data: { status: 'SUCCESS' }
    });

    res.status(200).json({
      success: true,
      message: 'Withdrawal successfully approved.',
      data: updated
    });
  } catch (err) {
    console.error('Error approving withdrawal:', err);
    res.status(500).json({ success: false, message: 'Server error approving withdrawal.' });
  }
}

/**
 * 5. Reject Withdrawal request (Refund balance)
 */
async function rejectWithdrawal(req, res) {
  const { id } = req.params;

  try {
    const wd = await prisma.withdrawal.findUnique({
      where: { id },
      include: { streamer: true }
    });

    if (!wd) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
    }

    if (wd.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Withdrawal request is already processed.' });
    }

    // Atomic Prisma Transaction: Reject WD + Refund balance
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id },
        data: { status: 'FAILED' }
      }),
      prisma.user.update({
        where: { id: wd.streamer_id },
        data: {
          balance: { increment: wd.amount_requested }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Withdrawal rejected and balance refunded to creator wallet.'
    });
  } catch (err) {
    console.error('Error rejecting withdrawal:', err);
    res.status(500).json({ success: false, message: 'Server error rejecting withdrawal.' });
  }
}

/**
 * 6. Fetch All Transactions
 */
async function getAllTransactions(req, res) {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        streamer: {
          select: { username: true, avatar_url: true }
        },
        gift: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch gacha logs to identify gacha transactions
    const gachaLogs = await prisma.gachaLog.findMany({
      where: {
        streamer_id: { in: transactions.map(t => t.streamer_id) }
      }
    });

    const formatted = transactions.map(t => {
      let avatar = t.streamer.avatar_url;
      if (!avatar || avatar.includes('unsplash.com')) {
        let sum = 0;
        for (let i = 0; i < t.streamer.username.length; i++) {
          sum += t.streamer.username.charCodeAt(i);
        }
        avatar = `/avatars/avatar-${(sum % 8) + 1}.svg`;
      }

      // Check if this transaction matches a GachaLog entry
      const isGacha = gachaLogs.some(log => 
        log.streamer_id === t.streamer_id &&
        log.donor_name === t.sender_name &&
        Math.abs(Number(log.amount) - Number(t.gross_amount)) < 0.01 &&
        Math.abs(new Date(log.createdAt).getTime() - new Date(t.createdAt).getTime()) < 5000
      );

      const rawType = t.gift_id ? 'GIFT' : (isGacha ? 'GACHA' : t.type);

      return {
        id: t.id,
        reference_id: t.reference_id,
        creator: t.streamer.username,
        creator_avatar: avatar,
        sender: t.sender_name,
        amount: parseFloat(t.gross_amount),
        type: t.type,
        raw_type: rawType,
        status: t.status,
        message: t.message || 'Dukungan untuk kreator!',
        gift_name: t.gift ? t.gift.name : null,
        date: new Date(t.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error('Error fetching admin transactions:', err);
    res.status(500).json({ success: false, message: 'Server error fetching transactions.' });
  }
}

/**
 * 7. Simulate Live Transaction (Donation/Mabar Sandbox)
 */
async function simulateTransaction(req, res) {
  const { creatorUsername, senderName, senderEmail, amount, type, message, packageId, ingameId, mediashareUrl, donation_media, originalAmount, currencyCode, quantity, giftId, soundboardItemId } = req.body;

  try {
    // Find creator user
    const creator = await prisma.user.findFirst({
      where: {
        username: {
          equals: creatorUsername,
          mode: 'insensitive'
        }
      }
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: `Creator @${creatorUsername} not found.` });
    }

    // Resolve GamePackage for queue
    let packageUuid = packageId;
    if (type === 'MABAR') {
      if (!packageUuid) {
        const firstPkg = await prisma.gamePackage.findFirst({
          where: { streamer_id: creator.id }
        });
        if (firstPkg) {
          packageUuid = firstPkg.id;
        }
      }
    }

    let selectedGift = null;
    if (giftId && type === 'DONATION') {
      selectedGift = await prisma.systemGift.findFirst({
        where: { id: giftId, isActive: true }
      });
      if (!selectedGift) {
        return res.status(400).json({ success: false, message: 'Gift animasi tidak tersedia.' });
      }

      const disabledGift = await prisma.creatorGiftSetting.findFirst({
        where: { userId: creator.id, giftId, isEnabled: false }
      });
      if (disabledGift) {
        return res.status(400).json({ success: false, message: 'Gift animasi dinonaktifkan oleh kreator.' });
      }
    }

    // Fetch active fee percentages from DB settings
    let donationRate = 5.00;
    let mabarRate = 8.00;
    let giftRate = 10.00;
    try {
      const activeSettings = await prisma.siteSetting.findFirst();
      if (activeSettings) {
        donationRate = parseFloat(activeSettings.feeDonation);
        mabarRate = parseFloat(activeSettings.feeMabar);
        giftRate = parseFloat(activeSettings.feeGift || 10);
      }
    } catch (err) {
      console.error("Error loading active fee rates for transaction simulation:", err);
    }

    const activeFeePercent = selectedGift ? giftRate : (type === 'DONATION' ? donationRate : mabarRate);
    const grossAmount = parseFloat(amount);
    const platformFee = (grossAmount * activeFeePercent) / 100;
    const netAmount = grossAmount - platformFee;

    let normalizedMediashareUrl = mediashareUrl || null;
    let normalizedDonationMedia = donation_media || null;
    if (donation_media && ['YOUTUBE', 'TIKTOK', 'REELS'].includes(donation_media.media_type)) {
      const resolvedMedia = resolveMediaUrl(donation_media.media_url || mediashareUrl, donation_media.media_type);
      if (!resolvedMedia.valid) {
        return res.status(400).json({ success: false, message: resolvedMedia.message });
      }
      normalizedMediashareUrl = resolvedMedia.normalizedUrl;
      normalizedDonationMedia = {
        ...donation_media,
        media_type: resolvedMedia.mediaType,
        media_url: resolvedMedia.normalizedUrl
      };
    }

    const trxRefId = `TRX-SIM-${Date.now().toString().slice(-6)}`;
    const rawMessage = message || 'Simulasi dukungan dari superadmin sandbox!';
    const filteredMessage = await filterService.filterMessageIfNeeded(creator.id, rawMessage);

    // Atomic transaction: Insert simulated payment + update creator balance
    const [transaction] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          reference_id: trxRefId,
          streamer_id: creator.id,
          sender_name: senderName || 'Anonymous',
          sender_email: senderEmail || null,
          original_amount: originalAmount ? parseFloat(originalAmount) : grossAmount,
          currency_code: currencyCode || 'IDR',
          gross_amount: grossAmount,
          platform_fee: platformFee,
          net_amount: netAmount,
          type: type || 'DONATION',
          status: 'SUCCESS',
          message: filteredMessage,
          mediashare_url: normalizedMediashareUrl,
          gift_id: selectedGift ? selectedGift.id : null,
          soundboard_item_id: soundboardItemId || null,
          donation_media: normalizedDonationMedia ? {
            create: {
              media_type: normalizedDonationMedia.media_type,
              media_url: normalizedDonationMedia.media_url,
              duration: normalizedDonationMedia.duration ? parseInt(normalizedDonationMedia.duration) : undefined,
              start_time: normalizedDonationMedia.start_time ? parseInt(normalizedDonationMedia.start_time) : undefined,
              volume_multiplier: normalizedDonationMedia.volume_multiplier ? parseFloat(normalizedDonationMedia.volume_multiplier) : undefined
            }
          } : undefined
        },
        include: {
          donation_media: true,
          gift: true
        }
      }),
      prisma.user.update({
        where: { id: creator.id },
        data: {
          balance: { increment: netAmount }
        }
      })
    ]);

    // Create queue entry if type is MABAR and package is resolved
    let finalSlots = 1;
    let bonusSlots = 0;
    if (type === 'MABAR' && packageUuid) {
      const parsedQuantity = parseInt(quantity, 10) || 1;
      if (creator.mabar_promo_buy > 0 && creator.mabar_promo_get > 0 && parsedQuantity >= creator.mabar_promo_buy) {
        bonusSlots = Math.floor(parsedQuantity / creator.mabar_promo_buy) * creator.mabar_promo_get;
      }
      finalSlots = parsedQuantity + bonusSlots;

      await prisma.mabarQueue.create({
        data: {
          transaction_id: transaction.id,
          package_id: packageUuid,
          ingame_nickname: senderName || 'Anonymous',
          ingame_id: ingameId || '1234567',
          status: 'WAITING',
          slots_count: finalSlots
        }
      });
    }

    // Broadcast socket event if socket is available
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      if (io) {
        // Fetch Soundboard item if purchased
        let soundboardItem = null;
        if (transaction.soundboard_item_id) {
          try {
            soundboardItem = await prisma.soundboardItem.findUnique({
              where: { id: transaction.soundboard_item_id }
            });
          } catch (soundErr) {
            console.warn('Failed to fetch soundboard item in simulation:', soundErr);
          }
        }

        // Check Gacha settings
        let gachaResult = null;
        if (type === 'DONATION') {
          try {
            const gachaSetting = await prisma.gachaSetting.findUnique({
              where: { streamer_id: creator.id }
            });
            const hasInteractiveMedia = !!(mediashareUrl || donation_media);
            if (gachaSetting && gachaSetting.is_enabled && !hasInteractiveMedia && Number(grossAmount) >= Number(gachaSetting.min_donation)) {
              const gachaItems = await prisma.gachaWheelItem.findMany({
                where: { streamer_id: creator.id }
              });
              if (gachaItems.length > 0) {
                const totalWeight = gachaItems.reduce((sum, item) => sum + (item.weight || 1), 0);
                let randomNum = Math.random() * totalWeight;
                let selectedItem = gachaItems[0];
                for (const item of gachaItems) {
                  randomNum -= (item.weight || 1);
                  if (randomNum <= 0) {
                    selectedItem = item;
                    break;
                  }
                }
                const loggedGacha = await prisma.gachaLog.create({
                  data: {
                    streamer_id: creator.id,
                    donor_name: senderName || 'Anonymous',
                    amount: grossAmount,
                    reward_name: selectedItem.name
                  }
                });

                 // Auto Mabar Queue integration if reward name contains mabar/main bareng (case-insensitive)
                 const rewardNameLower = selectedItem.name.toLowerCase();
                 if (rewardNameLower.includes('mabar') || rewardNameLower.includes('main bareng') || rewardNameLower.includes('main game')) {
                  try {
                    let slotsCount = 1;
                    const match = selectedItem.name.match(/\d+/);
                    if (match) {
                      slotsCount = parseInt(match[0], 10);
                    }

                    // Get or create GamePackage
                    let packageId;
                    const activePackage = await prisma.gamePackage.findFirst({
                      where: { streamer_id: creator.id, status: 'ACTIVE' }
                    });
                    if (activePackage) {
                      packageId = activePackage.id;
                    } else {
                      const newPackage = await prisma.gamePackage.create({
                        data: {
                          streamer_id: creator.id,
                          game_name: "Hadiah Gacha Wheel",
                          price_per_slot: 0,
                          status: "ACTIVE"
                        }
                      });
                      packageId = newPackage.id;
                    }

                    // Create queue entry
                    await prisma.mabarQueue.create({
                      data: {
                        transaction_id: transaction.id,
                        package_id: packageId,
                        ingame_nickname: senderName || 'Gacha Winner',
                        ingame_id: 'Gacha Winner',
                        status: 'WAITING',
                        slots_count: slotsCount
                      }
                    });
                    console.log(`[Simulation] Auto Mabar queue entry created for Gacha win: ${selectedItem.name}`);
                  } catch (queueErr) {
                    console.warn('Failed to auto create Mabar queue from Gacha reward in simulation:', queueErr);
                  }
                }
                
                gachaResult = {
                  ...loggedGacha,
                  items: gachaItems,
                  duration_sec: gachaSetting.duration_sec,
                  winnerIndex: gachaItems.findIndex(item => item.id === selectedItem.id)
                };
              }
            }
          } catch (gachaErr) {
            console.warn('Failed to process Gacha trigger in simulation:', gachaErr);
          }
        }

        const donationMedia = transaction.donation_media;
        const isVideoMedia = donationMedia && ['YOUTUBE', 'TIKTOK', 'REELS'].includes(donationMedia.media_type);

        if (transaction.mediashare_url || isVideoMedia) {
          const mediaUrl = transaction.mediashare_url || (donationMedia ? donationMedia.media_url : null);
          const payload = {
            id: transaction.id,
            sender_name: senderName || 'Anonymous',
            gross_amount: grossAmount,
            original_amount: originalAmount ? parseFloat(originalAmount) : grossAmount,
            currency_code: currencyCode || 'IDR',
            message: transaction.message || '',
            mediashare_url: mediaUrl,
            donation_media: donationMedia || null,
            gift: transaction.gift || null,
            soundboard: soundboardItem || null,
            gacha: gachaResult || null,
            timestamp: new Date()
          };
          io.to(`mediashare:${creator.id}`).emit('alert:mediashare', payload);
        } else {
          const isGacha = !!gachaResult;
          const eventName = isGacha ? 'alert:gacha' : (type === 'DONATION' ? 'alert:donation' : 'alert:mabar');
          const finalMsg = (type === 'MABAR' && bonusSlots > 0)
            ? `${transaction.message || 'Pemesanan Jasa Mabar'} 🎉 (Promo: +${bonusSlots} Bonus Slot gratis! Total: ${finalSlots} Slot)`
            : (transaction.message || '');
            
          io.to(`alert:${creator.id}`).emit(eventName, {
            id: transaction.id,
            sender_name: senderName || 'Anonymous',
            gross_amount: grossAmount,
            original_amount: originalAmount ? parseFloat(originalAmount) : grossAmount,
            currency_code: currencyCode || 'IDR',
            message: finalMsg,
            slots_count: finalSlots,
            ingame_nickname: senderName || 'Anonymous',
            ingame_id: ingameId || '1234567',
            donation_media: donationMedia || null,
            gift: transaction.gift || null,
            soundboard: soundboardItem || null,
            gacha: gachaResult || null,
            timestamp: new Date()
          });
        }

        if (type === 'MABAR') {
          const queueService = require('../services/queue.service');
          const updatedQueue = await queueService.getActiveQueues(creator.id);
          io.to(creator.id).emit('queue:update', updatedQueue);
        }
      }
    } catch (err) {
      // Socket broadcast skipped if not active
    }

    res.status(201).json({
      success: true,
      message: `Simulasi transaksi Rp ${grossAmount.toLocaleString('id-ID')} berhasil disimpan ke database!`,
      data: {
        id: transaction.id,
        reference_id: transaction.reference_id,
        creator: creator.username,
        sender: transaction.sender_name,
        amount: parseFloat(transaction.gross_amount),
        type: transaction.type,
        status: transaction.status,
        message: transaction.message,
        date: new Date(transaction.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    });
  } catch (err) {
    console.error('Error simulating sandbox transaction:', err);
    res.status(500).json({ success: false, message: 'Server error simulating transaction.' });
  }
}

/**
 * 8. Create Creator (User)
 */
async function createCreator(req, res) {
  const { username, email, balance, avatarUrl, roleTitle } = req.body;

  try {
    const cleanUsername = username.trim().replace("@", "");
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Creator username already exists.' });
    }

    // Server-side validation: Profile Photo must not exceed 500KB
    if (avatarUrl && avatarUrl.startsWith("data:")) {
      const approxBytes = (avatarUrl.length * 3) / 4;
      if (approxBytes > 500 * 1024) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ukuran foto profil tidak boleh melebihi 500 KB.' 
        });
      }
    }

    let finalAvatarUrl = avatarUrl || null;

    if (finalAvatarUrl && finalAvatarUrl.startsWith("data:")) {
      // Automatically convert Base64 avatar to Cloudflare R2 URL if configured
      finalAvatarUrl = await processBase64Upload(finalAvatarUrl, cleanUsername, 'avatar', 'avatars');
    }

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
        console.error("Error picking random avatar during manual creator creation:", err);
      }

      // Final fallback if DB query failed or returned empty
      if (!finalAvatarUrl) {
        finalAvatarUrl = `/avatars/avatar-${Math.floor(Math.random() * 8) + 1}.svg`;
      }
    }

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: email.trim(),
        avatar_url: finalAvatarUrl,
        balance: balance !== undefined ? parseFloat(balance) : 0.00,
        role_title: roleTitle || 'STREAMER & KREATOR'
      }
    });

    // Create default packages
    await prisma.gamePackage.createMany({
      data: [
        {
          streamer_id: newUser.id,
          game_name: 'Custom Consultation 1-on-1',
          price_per_slot: 75000.00,
          status: 'ACTIVE'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Creator successfully created.',
      data: {
        ...newUser,
        balance: parseFloat(newUser.balance),
        role: "GAMER",
        isVerified: true,
        status: "ACTIVE",
        isLive: newUser.is_live
      }
    });
  } catch (err) {
    console.error('Error creating creator:', err);
    res.status(500).json({ success: false, message: 'Server error creating creator.' });
  }
}

/**
 * 9. Get Website settings (Persisted Postgres Database)
 */
async function getSettings(req, res) {
  try {
    let settings = await prisma.siteSetting.findFirst();
    
    const DEFAULT_SETTINGS = {
      logoText: "treetmi",
      logoUrl: "",
      iconUrl: "",
      companyName: "PT Asosiasi Karya Treetmi",
      seoTitle: "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia",
      metaDesc: "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.",
      keywords: "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar",
      feeDonation: 5.00,
      feeMabar: 8.00,
      feeGift: 10.00,
      ahuNumber: "",
      pseNumber: "",
      nibNumber: "",
      ahuLogo: "",
      pseLogo: "",
      nibLogo: "",
      paymentGateway: "MIDTRANS",
      paymentSandbox: true,
      midtransMerchantId: "",
      midtransClientKey: "",
      midtransServerKey: "",
      xenditApiKey: "",
      discordUrl: "",
      xUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      showLeaderboard: false,
      whatsappGateway: "SIMULATION",
      whatsappApiKey: "",
      whatsappSender: "",
      whatsappTemplate: "Halo! 👾 Kreator favoritmu {creator} sekarang sedang LIVE streaming di Treetmi! Yuk nonton dan dukung di: {url}",
      supportWhatsapp: "628123456789",
      discordReportWebhook: ""
    };

    if (!settings) {
      // Create the single settings row if it doesn't exist
      settings = await prisma.siteSetting.create({
        data: DEFAULT_SETTINGS
      });
    }

    const fs = require('fs');
    const path = require('path');
    const ratesPath = path.join(__dirname, '../config/exchange_rates.json');
    let rates = {
      USD: 16000,
      MYR: 3400,
      SGD: 11800,
      PHP: 280,
      THB: 440
    };
    try {
      if (fs.existsSync(ratesPath)) {
        rates = JSON.parse(fs.readFileSync(ratesPath, 'utf8'));
      }
    } catch (e) {
      console.error('Error reading exchange rates:', e);
    }

    const formatted = {
      ...settings,
      feeDonation: parseFloat(settings.feeDonation),
      feeMabar: parseFloat(settings.feeMabar),
      feeGift: parseFloat(settings.feeGift || 10),
      rates: rates
    };

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error('Error fetching settings from DB:', err);
    res.status(500).json({ success: false, message: 'Server error fetching settings.' });
  }
}

/**
 * 10. Save Website settings (Persisted Postgres Database + mirrored to local frontend assets file)
 */
async function saveSettings(req, res) {
  try {
    const { logoText, logoUrl, iconUrl, companyName, seoTitle, metaDesc, keywords, feeDonation, feeMabar, feeGift, rates, ahuNumber, pseNumber, nibNumber, ahuLogo, pseLogo, nibLogo, paymentGateway, paymentSandbox, midtransMerchantId, midtransClientKey, midtransServerKey, xenditApiKey, discordUrl, xUrl, instagramUrl, tiktokUrl, showLeaderboard, whatsappGateway, whatsappApiKey, whatsappSender, whatsappTemplate, supportWhatsapp, discordReportWebhook } = req.body;
    
    // Find if settings already exist
    let settings = await prisma.siteSetting.findFirst();

    // Process optional base64 uploads (like other files/images)
    let processedAhuLogo = ahuLogo || "";
    let processedPseLogo = pseLogo || "";
    let processedNibLogo = nibLogo || "";

    if (processedAhuLogo && processedAhuLogo.startsWith("data:")) {
      processedAhuLogo = await processBase64Upload(processedAhuLogo, "ahu-logo", "setting", "settings");
    }
    if (processedPseLogo && processedPseLogo.startsWith("data:")) {
      processedPseLogo = await processBase64Upload(processedPseLogo, "pse-logo", "setting", "settings");
    }
    if (processedNibLogo && processedNibLogo.startsWith("data:")) {
      processedNibLogo = await processBase64Upload(processedNibLogo, "nib-logo", "setting", "settings");
    }

    const dataPayload = {
      logoText: logoText || "treetmi",
      logoUrl: logoUrl || "",
      iconUrl: iconUrl || "",
      companyName: companyName || "PT Asosiasi Karya Treetmi",
      seoTitle: seoTitle || "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia",
      metaDesc: metaDesc || "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.",
      keywords: keywords || "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar",
      feeDonation: feeDonation !== undefined ? parseFloat(feeDonation) : 5.00,
      feeMabar: feeMabar !== undefined ? parseFloat(feeMabar) : 8.00,
      feeGift: feeGift !== undefined ? parseFloat(feeGift) : 10.00,
      ahuNumber: ahuNumber || "",
      pseNumber: pseNumber || "",
      nibNumber: nibNumber || "",
      ahuLogo: processedAhuLogo,
      pseLogo: processedPseLogo,
      nibLogo: processedNibLogo,
      paymentGateway: paymentGateway || "MIDTRANS",
      paymentSandbox: paymentSandbox !== undefined ? Boolean(paymentSandbox) : true,
      midtransMerchantId: midtransMerchantId || "",
      midtransClientKey: midtransClientKey || "",
      midtransServerKey: midtransServerKey || "",
      xenditApiKey: xenditApiKey || "",
      discordUrl: discordUrl || "",
      xUrl: xUrl || "",
      instagramUrl: instagramUrl || "",
      tiktokUrl: tiktokUrl || "",
      showLeaderboard: showLeaderboard !== undefined ? Boolean(showLeaderboard) : false,
      whatsappGateway: whatsappGateway || "SIMULATION",
      whatsappApiKey: whatsappApiKey || "",
      whatsappSender: whatsappSender || "",
      whatsappTemplate: whatsappTemplate || "Halo! 👾 Kreator favoritmu {creator} sekarang sedang LIVE streaming di Treetmi! Yuk nonton dan dukung di: {url}",
      supportWhatsapp: supportWhatsapp || "628123456789",
      discordReportWebhook: discordReportWebhook || ""
    };

    if (settings) {
      // Update existing setting row
      settings = await prisma.siteSetting.update({
        where: { id: settings.id },
        data: dataPayload
      });
    } else {
      // Create new setting row
      settings = await prisma.siteSetting.create({
        data: dataPayload
      });
    }

    // Save exchange rates to file
    let savedRates = {
      USD: 16000,
      MYR: 3400,
      SGD: 11800,
      PHP: 280,
      THB: 440
    };
    if (rates) {
      try {
        const fs = require('fs');
        const path = require('path');
        const ratesPath = path.join(__dirname, '../config/exchange_rates.json');
        fs.writeFileSync(ratesPath, JSON.stringify(rates, null, 2), 'utf8');
        savedRates = rates;
      } catch (e) {
        console.error('Error writing exchange rates:', e);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Website settings successfully saved to PostgreSQL database.',
      data: {
        ...settings,
        feeDonation: parseFloat(settings.feeDonation),
        feeMabar: parseFloat(settings.feeMabar),
        feeGift: parseFloat(settings.feeGift || 10),
        rates: savedRates
      }
    });
  } catch (err) {
    console.error('Error saving settings to DB:', err);
    res.status(500).json({ success: false, message: 'Server error saving settings.', error: err.message, stack: err.stack });
  }
}

/**
 * 11. Fetch All Master Avatars
 */
async function getAllAvatars(req, res) {
  try {
    const avatars = await prisma.avatar.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: avatars });
  } catch (err) {
    console.error('Error fetching avatars:', err);
    res.status(500).json({ success: false, message: 'Server error fetching avatars.' });
  }
}

/**
 * 12. Create Master Avatar
 */
async function createAvatar(req, res) {
  const { name, url } = req.body;

  try {
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Nama dan URL/Gambar avatar wajib diisi!' });
    }

    // Validation: if it is base64 image, limit to 500KB
    if (url.startsWith("data:")) {
      const approxBytes = (url.length * 3) / 4;
      if (approxBytes > 500 * 1024) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ukuran foto avatar tidak boleh melebihi 500 KB.' 
        });
      }
    }

    // Automatically convert Base64 avatar to Cloudflare R2 URL if configured
    const finalAvatarUrl = await processBase64Upload(url.trim(), name.trim(), '', 'avatars');

    const newAvatar = await prisma.avatar.create({
      data: {
        name: name.trim(),
        url: finalAvatarUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Avatar berhasil ditambahkan ke database master.',
      data: newAvatar
    });
  } catch (err) {
    console.error('Error creating avatar:', err);
    res.status(500).json({ success: false, message: 'Server error creating avatar.' });
  }
}

/**
 * 13. Update Master Avatar
 */
async function updateAvatar(req, res) {
  const { id } = req.params;
  const { name, url } = req.body;

  try {
    const avatar = await prisma.avatar.findUnique({ where: { id } });
    if (!avatar) {
      return res.status(404).json({ success: false, message: 'Avatar tidak ditemukan.' });
    }

    // Validation: if it is base64 image, limit to 500KB
    if (url && url.startsWith("data:")) {
      const approxBytes = (url.length * 3) / 4;
      if (approxBytes > 500 * 1024) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ukuran foto avatar tidak boleh melebihi 500 KB.' 
        });
      }
    }

    // Automatically convert Base64 avatar to Cloudflare R2 URL if configured
    let finalAvatarUrl = avatar.url;
    if (url !== undefined) {
      finalAvatarUrl = await processBase64Upload(url.trim(), name !== undefined ? name.trim() : avatar.name, '', 'avatars');
    }

    const updated = await prisma.avatar.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : avatar.name,
        url: finalAvatarUrl
      }
    });

    res.status(200).json({
      success: true,
      message: 'Detail avatar berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    console.error('Error updating avatar:', err);
    res.status(500).json({ success: false, message: 'Server error updating avatar.' });
  }
}

/**
 * 14. Delete Master Avatar
 */
async function deleteAvatar(req, res) {
  const { id } = req.params;

  try {
    const avatar = await prisma.avatar.findUnique({ where: { id } });
    if (!avatar) {
      return res.status(404).json({ success: false, message: 'Avatar tidak ditemukan.' });
    }

    // Automatically delete file from Cloudflare R2 bucket if it is stored there
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://cdn-storage.treetmi.id';
    const cleanDomain = publicDomain.replace(/https?:\/\//, '');
    if (avatar.url && avatar.url.includes(cleanDomain)) {
      try {
        const { deleteFromR2 } = require('../config/r2');
        await deleteFromR2(avatar.url);
      } catch (err) {
        console.error('⚠️ [deleteAvatar] Failed to clean up file from R2:', err);
      }
    }

    await prisma.avatar.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Avatar berhasil dihapus dari database master.'
    });
  } catch (err) {
    console.error('Error deleting avatar:', err);
    res.status(500).json({ success: false, message: 'Server error deleting avatar.' });
  }
}

/**
 * 15. Fetch All Trust Badges
 */
async function getAllTrustBadges(req, res) {
  try {
    const badges = await prisma.trustBadge.findMany({
      orderBy: { min_supporters: 'asc' }
    });
    res.status(200).json({ success: true, data: badges });
  } catch (err) {
    console.error('Error fetching trust badges:', err);
    res.status(500).json({ success: false, message: 'Server error fetching trust badges.' });
  }
}

/**
 * Helper to process Base64 data URI to Cloudflare R2 Upload
 */
async function processBase64Upload(base64Url, name, prefix = '', folder = 'uploads') {
  if (!base64Url || !base64Url.startsWith('data:')) {
    return base64Url;
  }
  
  try {
    const { uploadToR2 } = require('../config/r2');
    const matches = base64Url.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Url;
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    let ext = 'png';
    if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('mp3') || mimeType.includes('mpeg') || mimeType.includes('audio/mpeg')) ext = 'mp3';
    else if (mimeType.includes('wav')) ext = 'wav';
    else if (mimeType.includes('ogg')) ext = 'ogg';
    
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = prefix ? `${prefix}-${cleanName}-${Date.now()}.${ext}` : `${cleanName}-${Date.now()}.${ext}`;
    
    const r2Url = await uploadToR2(buffer, filename, mimeType, folder);
    if (r2Url) {
      return r2Url;
    }
  } catch (error) {
    console.error(`⚠️ [R2 ${prefix} Upload] Failed to process base64 upload, saving base64 directly:`, error);
  }
  
  return base64Url;
}

/**
 * 16. Create Trust Badge
 */
async function createTrustBadge(req, res) {
  const { name, min_supporters, badge_url, bg_class, glow_class, icon_class } = req.body;

  try {
    if (!name || min_supporters === undefined || !badge_url || !bg_class) {
      return res.status(400).json({ success: false, message: 'Nama, minimal supporter, gambar lencana, dan background class wajib diisi!' });
    }

    const cleanMinSupporters = parseInt(min_supporters, 10);
    if (isNaN(cleanMinSupporters) || cleanMinSupporters < 0) {
      return res.status(400).json({ success: false, message: 'Minimal supporter harus berupa angka non-negatif!' });
    }

    // Check unique name
    const existing = await prisma.trustBadge.findUnique({
      where: { name: name.trim() }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Lencana dengan nama tersebut sudah ada!' });
    }

    // Automatically convert Base64 to Cloudflare R2 URL if configured
    const finalBadgeUrl = await processBase64Upload(badge_url.trim(), name.trim(), 'badge', 'badges');

    const newBadge = await prisma.trustBadge.create({
      data: {
        name: name.trim(),
        min_supporters: cleanMinSupporters,
        badge_url: finalBadgeUrl,
        bg_class: bg_class.trim(),
        glow_class: (glow_class || '').trim(),
        icon_class: (icon_class || '').trim()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lencana baru berhasil ditambahkan.',
      data: newBadge
    });
  } catch (err) {
    console.error('Error creating trust badge:', err);
    res.status(500).json({ success: false, message: 'Server error creating trust badge.' });
  }
}

/**
 * 17. Update Trust Badge
 */
async function updateTrustBadge(req, res) {
  const { id } = req.params;
  const { name, min_supporters, badge_url, bg_class, glow_class, icon_class } = req.body;

  try {
    const badge = await prisma.trustBadge.findUnique({ where: { id } });
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Lencana tidak ditemukan.' });
    }

    const updateData = {};
    let finalBadgeName = badge.name;

    if (name !== undefined) {
      // Check unique name if changing
      if (name.trim().toLowerCase() !== badge.name.toLowerCase()) {
        const existing = await prisma.trustBadge.findUnique({
          where: { name: name.trim() }
        });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Lencana dengan nama tersebut sudah ada!' });
        }
      }
      updateData.name = name.trim();
      finalBadgeName = name.trim();
    }

    if (min_supporters !== undefined) {
      const cleanMin = parseInt(min_supporters, 10);
      if (isNaN(cleanMin) || cleanMin < 0) {
        return res.status(400).json({ success: false, message: 'Minimal supporter harus berupa angka non-negatif!' });
      }
      updateData.min_supporters = cleanMin;
    }

    if (badge_url !== undefined) {
      // Automatically convert Base64 to Cloudflare R2 URL if configured
      updateData.badge_url = await processBase64Upload(badge_url.trim(), finalBadgeName, 'badge', 'badges');
    }
    
    if (bg_class !== undefined) updateData.bg_class = bg_class.trim();
    if (glow_class !== undefined) updateData.glow_class = glow_class.trim();
    if (icon_class !== undefined) updateData.icon_class = icon_class.trim();

    const updated = await prisma.trustBadge.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      success: true,
      message: 'Lencana berhasil diperbarui.',
      data: updated
    });
  } catch (err) {
    console.error('Error updating trust badge:', err);
    res.status(500).json({ success: false, message: 'Server error updating trust badge.' });
  }
}

/**
 * 18. Delete Trust Badge
 */
async function deleteTrustBadge(req, res) {
  const { id } = req.params;

  try {
    const badge = await prisma.trustBadge.findUnique({ where: { id } });
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Lencana tidak ditemukan.' });
    }

    // Automatically delete file from Cloudflare R2 bucket if it is stored there
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://cdn-storage.treetmi.id';
    const cleanDomain = publicDomain.replace(/https?:\/\//, '');
    if (badge.badge_url && badge.badge_url.includes(cleanDomain)) {
      try {
        const { deleteFromR2 } = require('../config/r2');
        await deleteFromR2(badge.badge_url);
      } catch (err) {
        console.error('⚠️ [deleteTrustBadge] Failed to clean up file from R2:', err);
      }
    }

    await prisma.trustBadge.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Lencana berhasil dihapus.'
    });
  } catch (err) {
    console.error('Error deleting trust badge:', err);
    res.status(500).json({ success: false, message: 'Server error deleting trust badge.' });
  }
}

/**
 * Auth 1. Login admin - Langkah 1 (Cek password)
 */
async function loginAdmin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan Password wajib diisi!' });
  }

  try {
    const admin = await prisma.superadmin.findUnique({
      where: { username: username.trim() }
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Username atau Password salah!' });
    }

    const isMatch = verifyPassword(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau Password salah!' });
    }

    if (admin.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        username: admin.username,
        message: 'Masukkan kode OTP 2FA Anda'
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, isAdmin: true },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      requires2FA: false,
      token,
      adminUser: admin.username,
      message: 'Login berhasil!'
    });
  } catch (error) {
    console.error('Error login admin:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}

/**
 * Auth 2. Login admin - Langkah 2 (Verifikasi OTP 2FA)
 */
async function loginAdmin2FA(req, res) {
  const { username, token: otpToken } = req.body;
  if (!username || !otpToken) {
    return res.status(400).json({ success: false, message: 'Username dan Kode OTP wajib diisi!' });
  }

  try {
    const admin = await prisma.superadmin.findUnique({
      where: { username }
    });

    if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Akses ditolak atau 2FA tidak aktif.' });
    }

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token: otpToken,
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Kode OTP 2FA tidak valid atau kadaluarsa.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, isAdmin: true },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      token,
      adminUser: admin.username,
      message: 'Login superadmin berhasil!'
    });
  } catch (error) {
    console.error('Error login admin 2FA:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}

/**
 * Auth 3. Ganti password admin
 */
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const adminId = req.admin.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi!' });
  }

  try {
    const admin = await prisma.superadmin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan.' });
    }

    const isMatch = verifyPassword(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah!' });
    }

    const hashedNew = hashPassword(newPassword);
    await prisma.superadmin.update({
      where: { id: adminId },
      data: { password: hashedNew }
    });

    return res.status(200).json({ success: true, message: 'Password berhasil diubah!' });
  } catch (error) {
    console.error('Error change password:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}

/**
 * Auth 3.5. Get 2FA Status
 */
async function get2FAStatus(req, res) {
  try {
    const admin = await prisma.superadmin.findUnique({
      where: { id: req.admin.id }
    });
    return res.status(200).json({
      success: true,
      enabled: admin ? admin.twoFactorEnabled : false
    });
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching 2FA status.' });
  }
}

/**
 * Auth 4. Setup 2FA (Generate secret & QR Code)
 */
async function setup2FA(req, res) {
  const adminId = req.admin.id;

  try {
    const admin = await prisma.superadmin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin tidak ditemukan.' });
    }

    const secret = speakeasy.generateSecret({
      name: `Treetmi Superadmin (${admin.username})`,
      issuer: 'Treetmi.id'
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return res.status(200).json({
      success: true,
      secret: secret.base32,
      qrCodeUrl
    });
  } catch (error) {
    console.error('Error setup 2FA:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}

/**
 * Auth 5. Enable 2FA (Verifikasi OTP pertama kali lalu aktifkan)
 */
async function enable2FA(req, res) {
  const { secret, otpToken } = req.body;
  const adminId = req.admin.id;

  if (!secret || !otpToken) {
    return res.status(400).json({ success: false, message: 'Secret dan OTP wajib diisi!' });
  }

  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: otpToken,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid. Gagal mengaktifkan 2FA.' });
    }

    await prisma.superadmin.update({
      where: { id: adminId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true
      }
    });

    return res.status(200).json({ success: true, message: 'Two-Factor Authentication berhasil diaktifkan!' });
  } catch (error) {
    console.error('Error enable 2FA:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}

/**
 * Auth 6. Disable 2FA
 */
async function disable2FA(req, res) {
  const adminId = req.admin.id;

  try {
    await prisma.superadmin.update({
      where: { id: adminId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false
      }
    });

    return res.status(200).json({ success: true, message: 'Two-Factor Authentication dinonaktifkan.' });
  } catch (error) {
    console.error('Error disable 2FA:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}

/**
 * 23. Fetch All Filter Words
 */
async function getAllFilterWords(req, res) {
  try {
    const filterWords = await prisma.filterWord.findMany({
      where: { userId: null },
      orderBy: { word: 'asc' }
    });
    res.status(200).json({ success: true, data: filterWords });
  } catch (err) {
    console.error('Error fetching filter words:', err);
    res.status(500).json({ success: false, message: 'Server error fetching filter words.' });
  }
}

/**
 * 24. Create Filter Word
 */
async function createFilterWord(req, res) {
  const { word, type } = req.body;

  try {
    if (!word) {
      return res.status(400).json({ success: false, message: 'Kata wajib diisi!' });
    }

    const cleanWord = word.trim().toLowerCase();

    // Check if exists
    const existing = await prisma.filterWord.findFirst({
      where: { word: cleanWord, userId: null }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Kata "${cleanWord}" sudah terdaftar.` });
    }

    const newWord = await prisma.filterWord.create({
      data: {
        word: cleanWord,
        type: type || 'GAMBLING',
        userId: null
      }
    });

    // Invalidate word cache
    filterService.invalidateCache();

    res.status(201).json({
      success: true,
      message: 'Kata sensor berhasil ditambahkan.',
      data: newWord
    });
  } catch (err) {
    console.error('Error creating filter word:', err);
    res.status(500).json({ success: false, message: 'Server error creating filter word.' });
  }
}

/**
 * 24.5 Bulk Create Filter Words
 */
async function bulkCreateFilterWords(req, res) {
  const { words, defaultType } = req.body;

  try {
    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ success: false, message: 'Data kata-kata wajib dikirim sebagai array!' });
    }

    const cleanWords = words
      .map(item => {
        const w = typeof item === 'string' ? item : item.word;
        const t = typeof item === 'string' ? defaultType : (item.type || defaultType);
        return {
          word: w ? w.trim().toLowerCase() : '',
          type: t === 'PROFANITY' ? 'PROFANITY' : 'GAMBLING'
        };
      })
      .filter(item => item.word.length > 0);

    if (cleanWords.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada kata valid yang diunggah.' });
    }

    // Get existing global words to avoid duplicates
    const existing = await prisma.filterWord.findMany({
      where: { userId: null },
      select: { word: true }
    });
    const existingSet = new Set(existing.map(e => e.word.toLowerCase()));

    // Deduplicate incoming list internally and against DB
    const finalWordsToInsert = [];
    const seenInBatch = new Set();

    for (const item of cleanWords) {
      if (!existingSet.has(item.word) && !seenInBatch.has(item.word)) {
        finalWordsToInsert.push({
          word: item.word,
          type: item.type,
          userId: null
        });
        seenInBatch.add(item.word);
      }
    }

    if (finalWordsToInsert.length > 0) {
      await prisma.filterWord.createMany({
        data: finalWordsToInsert,
        skipDuplicates: true
      });
      // Invalidate filter cache
      filterService.invalidateCache();
    }

    res.status(201).json({
      success: true,
      message: `${finalWordsToInsert.length} kata sensor berhasil diimpor secara massal.`,
      insertedCount: finalWordsToInsert.length,
      skippedCount: cleanWords.length - finalWordsToInsert.length
    });
  } catch (err) {
    console.error('Error bulk creating filter words:', err);
    res.status(500).json({ success: false, message: 'Server error bulk creating filter words.' });
  }
}

/**
 * 25. Delete Filter Word
 */
async function deleteFilterWord(req, res) {
  const { id } = req.params;

  try {
    const wordExists = await prisma.filterWord.findUnique({
      where: { id }
    });

    if (!wordExists) {
      return res.status(404).json({ success: false, message: 'Kata sensor tidak ditemukan.' });
    }

    await prisma.filterWord.delete({
      where: { id }
    });

    // Invalidate word cache
    filterService.invalidateCache();

    res.status(200).json({
      success: true,
      message: 'Kata sensor berhasil dihapus.'
    });
  } catch (err) {
    console.error('Error deleting filter word:', err);
    res.status(500).json({ success: false, message: 'Server error deleting filter word.' });
  }
}

/**
 * Fetch WhatsApp delivery/broadcast logs
 */
async function getWhatsappLogs(req, res) {
  try {
    const logs = await prisma.whatsappBroadcastLog.findMany({
      include: {
        streamer: {
          select: {
            username: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 200 // limit to last 200 logs for performance
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('[getWhatsappLogs Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Trigger hot reload with newly generated Prisma Client
module.exports = {
  getAllCreators,
  updateCreator,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getAllTransactions,
  simulateTransaction,
  createCreator,
  getSettings,
  saveSettings,
  getAllAvatars,
  createAvatar,
  updateAvatar,
  deleteAvatar,
  getAllTrustBadges,
  createTrustBadge,
  updateTrustBadge,
  deleteTrustBadge,
  loginAdmin,
  loginAdmin2FA,
  changePassword,
  get2FAStatus,
  setup2FA,
  enable2FA,
  disable2FA,
  getAllFilterWords,
  createFilterWord,
  bulkCreateFilterWords,
  deleteFilterWord,
  getWhatsappLogs
};
