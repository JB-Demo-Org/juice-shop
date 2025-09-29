/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { UserDetailsComponent } from '../user-details/user-details.component'
import { FeedbackDetailsComponent } from '../feedback-details/feedback-details.component'
import { MatDialog } from '@angular/material/dialog'
import { FeedbackService } from '../Services/feedback.service'
import { MatTableDataSource } from '@angular/material/table'
import { UserService } from '../Services/user.service'
import { Component, OnInit, ViewChild, QueryList } from '@angular/core'
import { DomSanitizer, SecurityContext } from '@angular/platform-browser'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faArchive, faEye, faHome, faTrashAlt, faUser } from '@fortawesome/free-solid-svg-icons'
import { MatPaginator } from '@angular/material/paginator'
import { TranslateModule, TranslateService } from '@ngx-translate/core'

library.add(faUser, faEye, faHome, faArchive, faTrashAlt)
dom.watch()

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {

  public userDataSource: any
  public userDataSourceHidden: any
  public userColumns = ['user','email','user_detail']
  public feedbackDataSource: any
  public feedbackColumns = ['user', 'comment', 'rating', 'remove']
  public error: any
  public resultsLengthUser = 0
  public resultsLengthFeedback = 0
  @ViewChild('paginatorUsers') paginatorUsers: MatPaginator
  @ViewChild('paginatorFeedb') paginatorFeedb: MatPaginator
  constructor (private dialog: MatDialog, private userService: UserService, private feedbackService: FeedbackService,
    private sanitizer: DomSanitizer) {}

  ngOnInit () {
    this.findAllUsers()
    this.findAllFeedbacks()
  }

  findAllUsers () {
    this.userService.find().subscribe((users) => {
      this.userDataSource = users
      this.userDataSourceHidden = users
      for (let user of this.userDataSource) {
        // Sanitize user email using Angular's built-in sanitizer
        const sanitizedEmail = this.sanitizer.sanitize(SecurityContext.HTML, user.email) || ''
        user.email = this.sanitizer.bypassSecurityTrustHtml(`<span class="${user.token ? 'confirmation' : 'error'}">${sanitizedEmail}</span>`)
      }
      this.userDataSource = new MatTableDataSource(this.userDataSource)
      this.userDataSource.paginator = this.paginatorUsers
      this.resultsLengthUser = users.length

    },(err) => {
      this.error = err
      console.log(this.error)
    })
  }

  findAllFeedbacks () {
    this.feedbackService.find().subscribe((feedbacks) => {
      this.feedbackDataSource = feedbacks
      for (let feedback of this.feedbackDataSource) {
        // Sanitize feedback comment using Angular's built-in sanitizer
        const sanitizedComment = this.sanitizer.sanitize(SecurityContext.HTML, feedback.comment) || ''
        feedback.comment = this.sanitizer.bypassSecurityTrustHtml(sanitizedComment)
      }
      this.feedbackDataSource = new MatTableDataSource(this.feedbackDataSource)
      this.feedbackDataSource.paginator = this.paginatorFeedb
      this.resultsLengthFeedback = feedbacks.length
    },(err) => {
      this.error = err
      console.log(this.error)
    })
  }

  deleteFeedback (id: number) {
    this.feedbackService.del(id).subscribe(() => {
      this.findAllFeedbacks()
    },(err) => {
      this.error = err
      console.log(this.error)
    })
  }

  showUserDetail (id: number) {
    this.dialog.open(UserDetailsComponent, {
      data: {
        id: id
      }
    })
  }

  showFeedbackDetails (feedback: any, id: number) {
    this.dialog.open(FeedbackDetailsComponent, {
      data: {
        feedback: feedback,
        id: id
      }
    })
  }

  times (numberOfTimes: number) {
    return Array(numberOfTimes).fill('★')
  }

}
