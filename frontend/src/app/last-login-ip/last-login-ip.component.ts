/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
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
        // Sanitize last login IP to prevent XSS
        const sanitizedIp = this.sanitizeHtml(payload.data.lastLoginIp)
        this.lastLoginIp = this.sanitizer.bypassSecurityTrustHtml(`<small>${sanitizedIp}</small>`)
      }
    }
  }

  // HTML sanitization method to prevent XSS
  private sanitizeHtml(html: string): string {
    if (!html) return ''
    
    // Create a temporary DOM element to safely parse and sanitize HTML
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  }

}
