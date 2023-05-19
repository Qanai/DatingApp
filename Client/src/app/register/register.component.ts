import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors: Array<string> | undefined;

  constructor(private accountService: AccountService, private toastr: ToastrService, private builder: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  initializeForm() {
    this.registerForm = this.builder.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });

    this.registerForm.get("password")?.valueChanges.subscribe({
      next: () => this.registerForm.get("confirmPassword")?.updateValueAndValidity()
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) : Validators | null => {
      return control.value === control.parent?.get(matchTo)?.value ? null : { notMatching: true }
    }
  }

  register() {
    // console.log("form", this.registerForm.value);
    const dob = this.getDateOnly(this.registerForm.get("dateOfBirth")?.value);
    const values = {...this.registerForm.value, dateOfBirth: dob};
    // console.log("values", values);

    this.accountService.register(values).subscribe({
      next: ()=> {
        this.router.navigateByUrl("/members")
      },
      error: error => {
        this.validationErrors = error;
      }
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  showInvalid(fieldName:string): boolean | undefined | null {
    return this.registerForm.get(fieldName)?.errors && this.registerForm.get(fieldName)?.touched
  }

  invalidSpec(fieldName: string, validatorName: string): boolean {
    return this.registerForm.get(fieldName)?.hasError(validatorName) || false;
  }

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    let dtDob = new Date(dob);
    return new Date(dtDob.setMinutes(dtDob.getMinutes() - dtDob.getTimezoneOffset())).toISOString().slice(0, 10);
  }
}
