import { Component, OnInit } from '@angular/core';
import { User } from './models/user';
import { AccountService } from './services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'The Dating App';
  users: any;

  constructor(private accountService: AccountService) { }

  ngOnInit() {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userStr : string | null = localStorage.getItem("user");
    const user: User | null = userStr ? JSON.parse(userStr) : null;
    if (user) {
      this.accountService.setCurrentUser(user);
    }
  }  
}