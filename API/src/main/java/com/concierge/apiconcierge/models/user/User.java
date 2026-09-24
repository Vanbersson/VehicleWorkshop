package com.concierge.apiconcierge.models.user;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_user")
public class User implements UserDetails {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusEnableDisable status;

    private String name;

    private String password;

    private String email;

    private String cellphone;

    @Column(name = "limit_discount")
    private Integer limitDiscount;

    @Column(name = "photo_url")
    private String photoUrl;
    
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "role_desc")
    private String roleDesc;

    @Column(name = "role_func")
    private UserRoleEnum roleFunc;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        if (this.roleFunc == UserRoleEnum.ADMIN) {
            return List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN"),
                    new SimpleGrantedAuthority("ROLE_USER"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return status == StatusEnableDisable.Habilitado;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status == StatusEnableDisable.Habilitado;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return status == StatusEnableDisable.Habilitado;
    }

    @Override
    public boolean isEnabled() {
        return status == StatusEnableDisable.Habilitado;
    }
}
