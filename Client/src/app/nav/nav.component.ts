import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  model: any = {}

  constructor(public accountSevice: AccountService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  login() {
    this.accountSevice.login(this.model).subscribe({
      next: _ => {
        this.router.navigateByUrl("/members");
        this.model = {};
      }
    })
  }

  logout() {
    this.accountSevice.logout();
    this.router.navigateByUrl("/");
  }
}
