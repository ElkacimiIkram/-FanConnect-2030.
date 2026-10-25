package com.fanconnect.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PaymentCalculator {

    private PaymentCalculator() {
    }

    public record Breakdown(BigDecimal amount, BigDecimal platformFee, BigDecimal ownerPayout) {
    }

    public static Breakdown calculate(BigDecimal amount, BigDecimal commissionRate) {
        BigDecimal fee = amount.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal payout = amount.subtract(fee).setScale(2, RoundingMode.HALF_UP);
        return new Breakdown(amount, fee, payout);
    }
}