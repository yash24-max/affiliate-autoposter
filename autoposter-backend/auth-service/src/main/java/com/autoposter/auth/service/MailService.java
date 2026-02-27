package com.autoposter.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.mail.from}")
    private String fromAddress;

    public void sendVerificationEmail(String toEmail, String verificationToken) {
        String verifyLink = baseUrl + "/verify?token=" + verificationToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Verify your Affiliate Autoposter account");
        message.setText("Hi,\n\n" + "Please verify your email by clicking the link below:\n\n" + verifyLink + "\n\n" + "This link is valid until you use it.\n\n" + "If you did not register, ignore this email.");

        mailSender.send(message);
    }
}
