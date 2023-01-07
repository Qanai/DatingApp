import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { of } from 'rxjs';
import { Member } from 'src/app/models/member';
import { MembersService } from 'src/app/services/members.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  member: Member | undefined;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  constructor(private memberService: MembersService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.loadMember();

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
  }

  getImages(): Array<NgxGalleryImage> {
    return this.member ? this.member.photos.map(photo => { return { small: photo?.url, medium: photo?.url, big: photo?.url } }) : [];
  }

  loadMember() {
    const username = this.route.snapshot.paramMap.get("username");

    if (username) {
      this.memberService.getMember(username).subscribe(member => {
        this.member = member;

        this.galleryImages = this.getImages();
      });
    }
  }
}
