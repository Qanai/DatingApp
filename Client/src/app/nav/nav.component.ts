import { Component, OnInit } from '@angular/core';
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
  
  constructor(public accountSevice: AccountService) { }

  ngOnInit(): void {
  }

  login() {
    this.accountSevice.login(this.model).subscribe(response => {
      console.log(response);      
    }, error => {
      console.log(error);
    })
  }

  logout() {
    this.accountSevice.logout();    
  }
}
