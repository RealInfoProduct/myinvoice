import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { NgIf } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterUser } from 'src/app/interface/invoice';
import { FirebaseService } from 'src/app/services/firebase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService, private router: Router,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar,) { }

  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    this.loaderService.setLoader(true)
    this.authService.signUp(this.form.value.email, this.form.value.password).subscribe((res) => {
      if (res) {
        const data: RegisterUser = {
          id: '',
          email: this.form.value.email,
          password: this.form.value.password,
          isActive: false
        }
        this.firebaseService.addUserList(data).then((res) => {
          if (res) {
            this.openConfigSnackBar(`Your Email: ${this.form.value.email} Register Successfully.. Go to Loginpage...`)
            this.form.reset()
            this.loaderService.setLoader(false)

          }
        })
      }
    }, (err) => {
      this.openConfigSnackBar(err.error.error.message)
      this.loaderService.setLoader(false)

    }
    )
  }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
