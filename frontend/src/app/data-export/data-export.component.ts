/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { Component, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ImageCaptchaService } from '../Services/image-captcha.service'
import { DataSubjectService } from '../Services/data-subject.service'
import { DomSanitizer, SecurityContext } from '@angular/platform-browser'

@Component({
  selector: 'app-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss']
})
export class DataExportComponent implements OnInit {

  public captchaControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(5)])
  public formatControl: FormControl = new FormControl('', [Validators.required])
  public captcha: any
  private dataRequest: any = undefined
  public confirmation: any
  public error: any
  public lastSuccessfulTry: any
  public presenceOfCaptcha: boolean = false
  public userData: any

  constructor (public sanitizer: DomSanitizer, private imageCaptchaService: ImageCaptchaService, private dataSubjectService: DataSubjectService) { }
  ngOnInit () {
    this.needCaptcha()
    this.dataRequest = {}
  }

  needCaptcha () {
    let nowTime = new Date()
    let timeOfCaptcha = localStorage.getItem('lstdtxprt') ? new Date(JSON.parse(String(localStorage.getItem('lstdtxprt')))) : new Date(0)
    if (nowTime.getTime() - timeOfCaptcha.getTime() < 300000) {
      this.getNewCaptcha()
      this.presenceOfCaptcha = true
    }
  }

  getNewCaptcha () {
    this.imageCaptchaService.getCaptcha().subscribe((data: any) => {
      // Sanitize captcha image data using Angular's built-in sanitizer
      const sanitizedImage = this.sanitizer.sanitize(SecurityContext.HTML, data.image) || ''
      this.captcha = this.sanitizer.bypassSecurityTrustHtml(sanitizedImage)
    })
  }

  save () {
    if (this.presenceOfCaptcha) {
      this.dataRequest.answer = this.captchaControl.value
    }
    this.dataRequest.format = this.formatControl.value
    this.dataSubjectService.dataExport(this.dataRequest).subscribe((data: any) => {
      this.error = null
      this.confirmation = data.confirmation
      this.userData = data.userData
      // Fix DOM-based XSS: Use safe approach instead of document.write with unsanitized data
      this.displayUserDataSafely(this.userData)
      this.lastSuccessfulTry = new Date()
      localStorage.setItem('lstdtxprt',JSON.stringify(this.lastSuccessfulTry))
      this.ngOnInit()
      this.resetForm()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      this.resetFormError()
    })
  }

  resetForm () {
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
    this.formatControl.markAsUntouched()
    this.formatControl.markAsPristine()
    this.formatControl.setValue('')
  }

  resetFormError () {
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
  }

  // Safe method to display user data without XSS vulnerability
  private displayUserDataSafely(userData: string) {
    const sanitizedData = this.sanitizeHtml(userData)
    const blob = new Blob([sanitizedData], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const newWindow = window.open(url, '_blank', 'width=500')
    if (newWindow) {
      newWindow.onload = () => {
        window.URL.revokeObjectURL(url)
      }
    }
  }

}
