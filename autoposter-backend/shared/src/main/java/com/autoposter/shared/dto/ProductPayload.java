package com.autoposter.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPayload {

    private String asin;
    private String title;
    private BigDecimal price;
    private Integer discountPct;
    private Double rating;
    private String imageUrl;
    private String affiliateUrl;
    private String category;
}
