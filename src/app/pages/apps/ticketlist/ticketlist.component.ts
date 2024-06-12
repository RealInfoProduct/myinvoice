import { Component, OnInit, Inject, Optional, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

export interface TicketElement {
  id: number;
  title: string;
  subtext: string;
  assignee: string;
  imgSrc: string;
  status: string;
  date: string;
}

const tickets: TicketElement[] = [
  {
    id: 1,
    title: 'Sed ut perspiciatis unde omnis iste',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    imgSrc: '/assets/images/profile/user-1.jpg',
    assignee: 'Alice',
    status: 'inprogress',
    date: '2023-05-01',
  },
  {
    id: 2,
    title: 'Xtreme theme dropdown issue',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Jonathan',
    imgSrc: '/assets/images/profile/user-2.jpg',
    status: 'open',
    date: '2023-05-03',
  },
  {
    id: 3,
    title: 'Header issue in material admin',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Smith',
    imgSrc: '/assets/images/profile/user-3.jpg',
    status: 'closed',
    date: '2023-05-02',
  },
  {
    id: 4,
    title: 'Sidebar issue in Nice admin',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Vincent',
    imgSrc: '/assets/images/profile/user-4.jpg',
    status: 'inprogress',
    date: '2023-05-06',
  },
  {
    id: 5,
    title: 'Elegant Theme Side Menu show OnClick',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Chris',
    imgSrc: '/assets/images/profile/user-5.jpg',
    status: 'open',
    date: '2023-05-04',
  },
  {
    id: 6,
    title: 'Header issue in admin pro admin',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'James',
    imgSrc: '/assets/images/profile/user-6.jpg',
    status: 'closed',
    date: '2023-05-03',
  },
  {
    id: 7,
    title: 'Elegant Theme Side Menu OnClick',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Jonathan',
    imgSrc: '/assets/images/profile/user-7.jpg',
    status: 'inprogress',
    date: '2023-05-05',
  },
  {
    id: 8,
    title: 'adminpress Theme Side Menu not opening',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Smith',
    imgSrc: '/assets/images/profile/user-8.jpg',
    status: 'open',
    date: '2023-05-04',
  },
  {
    id: 9,
    title: 'Charts not proper in xtreme admin',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Markus',
    imgSrc: '/assets/images/profile/user-9.jpg',
    status: 'closed',
    date: '2023-05-02',
  },
  {
    id: 10,
    title: 'Psd not availabel with package',
    subtext:
      'ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos',
    assignee: 'Jane',
    imgSrc: '/assets/images/profile/user-10.jpg',
    status: 'closed',
    date: '2023-05-03',
  },
];

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticketlist.component.html',
})
export class AppTicketlistComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);
  searchText: any;
  totalCount = -1;
  Closed = -1;
  Inprogress = -1;
  Open = -1;

  displayedColumns: string[] = [
    'id',
    'title',
    'assignee',
    'status',
    'date',
    'action',
  ];
  dataSource = new MatTableDataSource(tickets);

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.totalCount = this.dataSource.data.length;
    this.Open = this.btnCategoryClick('Open');
    this.Closed = this.btnCategoryClick('Closed');
    this.Inprogress = this.btnCategoryClick('In Progress');
    this.dataSource = new MatTableDataSource(tickets);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  btnCategoryClick(val: string): number {
    this.dataSource.filter = val.trim().toLowerCase();
    return this.dataSource.filteredData.length;
  }

  openDialog(action: string, obj: any): void {
    obj.action = action;
    const dialogRef = this.dialog.open(AppTicketDialogContentComponent, {
      data: obj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.event === 'Add') {
        this.addRowData(result.data);
      } else if (result.event === 'Update') {
        this.updateRowData(result.data);
      } else if (result.event === 'Delete') {
        this.deleteRowData(result.data);
      }
    });
  }
  // tslint:disable-next-line - Disables all
  addRowData(row_obj: TicketElement): void {
    const d = new Date();
    this.dataSource.data.unshift({
      id: d.getTime(),
      title: row_obj.title,
      subtext: row_obj.subtext,
      assignee: row_obj.assignee,
      imgSrc: '/assets/images/profile/user-1.jpg',
      status: row_obj.status,
      date: row_obj.date,
    });
    this.table.renderRows();
  }

  // tslint:disable-next-line - Disables all
  updateRowData(row_obj: TicketElement): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value, key) => {
      if (value.id === row_obj.id) {
        value.title = row_obj.title;
        value.subtext = row_obj.subtext;
        value.assignee = row_obj.assignee;
        value.status = row_obj.status;
        value.date = row_obj.date;
      }
      return true;
    });
  }

  // tslint:disable-next-line - Disables all
  deleteRowData(row_obj: TicketElement): boolean | any {
    this.dataSource.data = this.dataSource.data.filter((value, key) => {
      return value.id !== row_obj.id;
    });
  }
}

@Component({
  // tslint:disable-next-line - Disables all
  selector: 'app-dialog-content',
  templateUrl: 'ticket-dialog-content.html',
})
// tslint:disable-next-line - Disables all
export class AppTicketDialogContentComponent {
  action: string;
  // tslint:disable-next-line - Disables all
  local_data: any;

  constructor(
    public dialogRef: MatDialogRef<AppTicketDialogContentComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: TicketElement
  ) {
    this.local_data = { ...data };
    this.action = this.local_data.action;
  }

  doAction(): void {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }

  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }
}
