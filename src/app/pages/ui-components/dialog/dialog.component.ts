import { Component, Inject, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

//  1
@Component({
  selector: 'dialog-overview',
  templateUrl: 'dialog-overview.component.html',
})
export class AppDialogOverviewComponent {
  constructor(public dialogRef: MatDialogRef<AppDialogOverviewComponent>) {}
}

/**
 * @title 2 Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'dialog-content',
  templateUrl: 'dialog-content.component.html',
})
export class AppDialogContentComponent {}

// 3
@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'dialog-data.component.html',
})
export class AppDialogDataComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}

// 4
@Component({
  selector: 'dialog-menu',
  templateUrl: 'dialog-menu.component.html',
})
export class AppDialogMenuComponent {}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class AppDialogComponent {
  // 4
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(public dialog: MatDialog) {}

  // 1
  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(AppDialogOverviewComponent, {
      width: '290px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  // 2
  openHeaderDialog() {
    const dialogRef = this.dialog.open(AppDialogContentComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  // 3
  openInjectDialog() {
    this.dialog.open(AppDialogDataComponent, {
      data: {
        animal: 'panda',
      },
    });
  }

  // 4

  openMenuDialog() {
    const dialogRef = this.dialog.open(AppDialogMenuComponent, {
      restoreFocus: false,
    });

    // Manually restore focus to the menu trigger since the element that
    // opens the dialog won't be in the DOM any more when the dialog closes.
    dialogRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }
}
