import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { NgIf } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirebaseService } from 'src/app/services/firebase.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, NgIf],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService,
    private router: Router,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private _snackBar: MatSnackBar,
    private loaderService: LoaderService,
  ) { }

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
    accountYear: new FormControl('', [Validators.required])
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    this.loaderService.setLoader(true)
    this.authService.signIn(this.form.value.uname, this.form.value.password).subscribe((res) => {

      if (res) {
        this.firebaseService.getUserList().subscribe((res => {
          if (res) {
            const userData: any = res.find((id: any) => id.email === this.form.value.uname && id.password === this.form.value.password)
            if (userData) {
              if (userData.isActive) {
                window.localStorage.setItem('userId', (userData.id));
                this.openConfigSnackBar('user login successfully')
                this.router.navigate(['/dashboards/dashboard1']);
                this.loaderService.setLoader(false)
              } else {
                this.openConfigSnackBar('user can not active !!')
                this.loaderService.setLoader(false)

              }
            }
          }
        }))
      }
    }, (err) => {
      this.openConfigSnackBar(err.error.error.message)
      this.loaderService.setLoader(false)

    })
  }

  openConfigSnackBar(snackbarTitle: any) {
    this._snackBar.open(snackbarTitle, 'Splash', {
      duration: 2 * 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
