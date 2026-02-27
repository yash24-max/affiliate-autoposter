package com.autoposter.auth.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordEncoderUtils {

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String encryptPassword(String password) {
        return passwordEncoder.encode(password);
    }

    public boolean verifyPassword(String password, String encodedPassword) {
        return passwordEncoder.matches(password, encodedPassword);
    }

}
