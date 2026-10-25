package com.fanconnect.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@ConfigurationProperties(prefix = "app.payment")
@Getter
@Setter
public class PaymentProperties {

    /** Platform commission rate (0.25 = 25%) */
    private BigDecimal commissionRate = new BigDecimal("0.25");

    /** simulated | stripe */
    private String mode = "simulated";

    private String stripeSecretKey = "";

    private String stripePublishableKey = "";
}