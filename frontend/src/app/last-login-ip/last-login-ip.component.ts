/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component } from '@angular/core'
import { DomSanitizer, SecurityContext } from '@angular/platform-browser'
import * as jwtDecode from 'jwt-decode'

@Component({
  selector: 'app-last-login-ip',
  templateUrl: './last-login-ip.component.html',
  styleUrls: ['./last-login-ip.component.scss']

})

export class LastLoginIpComponent {

  lastLoginIp: any = '?'
  constructor (private sanitizer: DomSanitizer) {}

  ngOnInit () {
    try {
      this.parseAuthToken()
    } catch (err) {
      console.log(err)
    }
  }

  parseAuthToken () {
    let payload = {} as any
    const token = localStorage.getItem('token')
    if (token) {
      payload = jwtDecode(token)
      if (payload.data.lastLoginIp) {
        // Sanitize last login IP using Angular's built-in sanitizer
        const sanitizedIp = this.sanitizer.sanitize(SecurityContext.HTML, payload.data.lastLoginIp) || ''
        this.lastLoginIp = this.sanitizer.bypassSecurityTrustHtml(`<small>${sanitizedIp}</small>`)
      }
    }
  }


}
