const prisma = require('../config/prisma');

/**
 * Service for Financial Transactions, Webhooks, and Withdrawals
 */
class FinanceService {
  /**
   * Mencatat transaksi awal dengan status PENDING
   */
  async createTransaction(data) {
    return await prisma.transaction.create({
      data: {
        streamer_id: data.streamer_id,
        sender_name: data.sender_name || 'Anonymous',
        gross_amount: data.gross_amount,
        platform_fee: 0, // Dihitung saat sukses
        net_amount: 0,   // Dihitung saat sukses
        type: data.type,
        message: data.message,
        status: 'PENDING',
        reference_id: data.reference_id,
        mediashare_url: data.mediashare_url,
        ...(data.donation_media && {
          donation_media: {
            create: {
              media_type: data.donation_media.media_type,
              media_url: data.donation_media.media_url,
              start_time: data.donation_media.start_time || 0,
              duration: data.donation_media.duration || 0,
              volume_multiplier: data.donation_media.volume_multiplier || 1.0,
            }
          }
        })
      }
    });
  }

  /**
   * Menangani Webhook Sukses dari Payment Gateway
   */
  async handleWebhookSuccess(referenceId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Ambil data transaksi
      const transaction = await tx.transaction.findUnique({
        where: { reference_id: referenceId },
        include: { streamer: true }
      });

      if (!transaction || transaction.status !== 'PENDING') {
        throw new Error('Transaksi tidak ditemukan atau sudah diproses');
      }

      // 2. Hitung fee & net amount dynamically from database
      let donationRate = 5.00;
      let mabarRate = 8.00;
      try {
        const activeSettings = await tx.siteSetting.findFirst();
        if (activeSettings) {
          donationRate = parseFloat(activeSettings.feeDonation);
          mabarRate = parseFloat(activeSettings.feeMabar);
        }
      } catch (err) {
        console.error("Error loading active fee rates in webhook settlement:", err);
      }

      const activeFeePercent = transaction.type === 'DONATION' ? donationRate : mabarRate;
      const platformFee = (Number(transaction.gross_amount) * activeFeePercent) / 100;
      const netAmount = Number(transaction.gross_amount) - platformFee;


      // 3. Update status transaksi
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          platform_fee: platformFee,
          net_amount: netAmount,
          status: 'SUCCESS'
        },
        include: {
          donation_media: true
        }
      });

      // 4. Tambahkan saldo ke streamer
      await tx.user.update({
        where: { id: transaction.streamer_id },
        data: {
          balance: { increment: netAmount }
        }
      });

      // 5. Jika tipe MABAR, buat antrean (logic tambahan bisa di controller atau di sini)
      // Kita kembalikan data untuk diproses lebih lanjut
      return { transaction: updatedTx, streamer: transaction.streamer };
    });
  }

  /**
   * Request Penarikan Saldo (Withdrawal)
   */
  async requestWithdrawal(streamerId, amount) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validasi saldo & bank account
      const user = await tx.user.findUnique({
        where: { id: streamerId },
        include: { bank_account: true }
      });

      if (!user.bank_account) {
        throw new Error('Silakan isi data rekening bank terlebih dahulu');
      }

      if (Number(user.balance) < Number(amount)) {
        throw new Error('Saldo tidak mencukupi');
      }

      // 2. Kurangi saldo
      await tx.user.update({
        where: { id: streamerId },
        data: { balance: { decrement: amount } }
      });

      // 3. Buat record penarikan
      return await tx.withdrawal.create({
        data: {
          streamer_id: streamerId,
          amount_requested: amount,
          status: 'PENDING'
        }
      });
    });
  }

  async updateBankAccount(streamerId, data) {
    const existing = await prisma.bankAccount.findUnique({
      where: { streamer_id: streamerId }
    });

    if (existing && existing.is_locked) {
      throw new Error('Rekening bank Anda sudah dikunci. Silakan ajukan pergantian melalui Tiket Bantuan.');
    }

    return await prisma.bankAccount.upsert({
      where: { streamer_id: streamerId },
      update: {
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_holder_name: data.account_holder_name,
        is_locked: true
      },
      create: {
        streamer_id: streamerId,
        bank_name: data.bank_name,
        account_number: data.account_number,
        account_holder_name: data.account_holder_name,
        is_locked: true
      }
    });
  }

  async getFinancialHistory(streamerId) {
    const transactions = await prisma.transaction.findMany({
      where: { streamer_id: streamerId },
      orderBy: { createdAt: 'desc' }
    });

    const withdrawals = await prisma.withdrawal.findMany({
      where: { streamer_id: streamerId },
      orderBy: { createdAt: 'desc' }
    });

    return { transactions, withdrawals };
  }
}

module.exports = new FinanceService();
