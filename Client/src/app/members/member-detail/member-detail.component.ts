import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/models/member';
import { Message } from 'src/app/models/message';
import { MembersService } from 'src/app/services/members.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild("memberTabs", { static: true }) memberTabs?: TabsetComponent;
  member: Member = {} as Member;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];
  activeTab?: TabDirective;
  messages: Array<Message> = [];

  constructor(private memberService: MembersService, private route: ActivatedRoute, private messageService: MessageService) {

  }

  ngOnInit(): void {
    this.route.data.subscribe({
      next: data => this.member = data["member"]
    });

    this.route.queryParams.subscribe({
      next: params => {
        params["tab"] && this.selectTab(params["tab"])
      }
    });

    this.galleryOptions = [
      {
        width: "500px",
        height: "500px",
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ]

    this.galleryImages = this.getImages();
  }

  getImages(): Array<NgxGalleryImage> {
    return this.member ? this.member.photos.map(photo => { return { small: photo?.url, medium: photo?.url, big: photo?.url } }) : [];
  }

  selectTab(heading: string) {
    if (this.memberTabs) {
      this.memberTabs.tabs.find(t => t.heading === heading)!.active = true;
    }
  }

  loadMessages() {
    if (this.member) {
      this.messageService.getMessagesThread(this.member.username).subscribe({
        next: messages => this.messages = messages
      })
    }
  }

  onTabAcivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === "Messages") {
      this.loadMessages();
    }
  }
}
