import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-progress-snipper',
  templateUrl: './progress-snipper.component.html',
})
export class AppProgressSnipperComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
}
