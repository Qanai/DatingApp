import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/models/member';
import { MembersService } from 'src/app/services/members.service';
import { PresenceService } from 'src/app/services/presence.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss']
})
export class MemberCardComponent implements OnInit {
  @Input() member!: Member;

  constructor(private memberService: MembersService, private toastr: ToastrService, public presenceService: PresenceService) { }

  ngOnInit(): void {
  }

  addLike(member: Member) {
    if (member) {
      this.memberService.addLike(member.username).subscribe({
        next: () => this.toastr.success(`You have liked ${member.knownAs}`)
      });
    }
  }
}
