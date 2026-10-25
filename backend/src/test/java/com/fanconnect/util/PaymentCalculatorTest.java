package com.fanconnect.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PaymentCalculatorTest {

    @Test
    void calculate_splits25PercentCommission() {
        PaymentCalculator.Breakdown breakdown = PaymentCalculator.calculate(
                new BigDecimal("100.00"),
                new BigDecimal("0.25")
        );

        assertEquals(new BigDecimal("100.00"), breakdown.amount());
        assertEquals(new BigDecimal("25.00"), breakdown.platformFee());
        assertEquals(new BigDecimal("75.00"), breakdown.ownerPayout());
    }

    @Test
    void calculate_roundsToTwoDecimals() {
        PaymentCalculator.Breakdown breakdown = PaymentCalculator.calculate(
                new BigDecimal("150"),
                new BigDecimal("0.25")
        );

        assertEquals(new BigDecimal("37.50"), breakdown.platformFee());
        assertEquals(new BigDecimal("112.50"), breakdown.ownerPayout());
    }
}