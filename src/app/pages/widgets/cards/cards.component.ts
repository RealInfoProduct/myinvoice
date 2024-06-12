import { Component } from '@angular/core';

// card 1
interface topcards {
  id: number;
  img: string;
  color: string;
  title: string;
  subtitle: string;
}

// card 2
interface cardimgs {
  id: number;
  time: string;
  imgSrc: string;
  user: string;
  title: string;
  views: string;
  category: string;
  comments: number;
  date: string;
}

// card 3
interface productcards {
  id: number;
  imgSrc: string;
  title: string;
  price: string;
  rprice: string;
}

// card 4
interface musiccards {
  id: number;
  imgSrc: string;
  title: string;
  subtext: string;
}

// card 5
interface followercards {
  id: number;
  imgSrc: string;
  title: string;
  subtext: string;
}

// card 6
interface friendcards {
  id: number;
  imgSrc: string;
  title: string;
}

// card 7
interface socialcards {
  id: number;
  imgSrc: string;
  username: string;
  post: string;
}

// card 8
interface giftcards {
  id: number;
  imgSrc: string;
  username: string;
}

// card 9
interface stats {
  id: number;
  color: string;
  title: string;
  subtitle: string;
  img: string;
  percent: string;
}

// card 10
interface stats2 {
  id: number;
  time: string;
  color: string;
  title?: string;
  subtext?: string;
  link?: string;
}

// card 11
interface activities {
  id: number;
  color: string;
  title: string;
  subtitle: string;
  icon: string;
  time: string;
}

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class AppCardsComponent {
  constructor() {}
  // card 1
  topcards: topcards[] = [
    {
      id: 1,
      color: 'primary',
      img: '/assets/images/svgs/icon-user-male.svg',
      title: 'Profile',
      subtitle: '3,685',
    },
    {
      id: 2,
      color: 'warning',
      img: '/assets/images/svgs/icon-briefcase.svg',
      title: 'Blog',
      subtitle: '256',
    },
    {
      id: 3,
      color: 'accent',
      img: '/assets/images/svgs/icon-mailbox.svg',
      title: 'Calendar',
      subtitle: '932',
    },
    {
      id: 4,
      color: 'error',
      img: '/assets/images/svgs/icon-favorites.svg',
      title: 'Email',
      subtitle: '$348K',
    },
    {
      id: 5,
      color: 'success',
      img: '/assets/images/svgs/icon-speech-bubble.svg',
      title: 'Chats',
      subtitle: '96',
    },
    {
      id: 6,
      color: 'accent',
      img: '/assets/images/svgs/icon-connect.svg',
      title: 'Contacts',
      subtitle: '48',
    },
  ];

  //   card 2
  cardimgs: cardimgs[] = [
    {
      id: 1,
      time: '2 mins Read',
      imgSrc: '/assets/images/blog/blog-img1.jpg',
      user: '/assets/images/profile/user-1.jpg',
      title: 'As yen tumbles, gadget-loving Japan goes for secondhand iPhones',
      views: '9,125',
      category: 'Social',
      comments: 3,
      date: 'Mon, Dec 23',
    },
    {
      id: 2,
      time: '2 mins Read',
      imgSrc: '/assets/images/blog/blog-img2.jpg',
      user: '/assets/images/profile/user-2.jpg',
      title:
        'Intel loses bid to revive antitrust case against patent foe Fortress',
      views: '9,125',
      category: 'Gadget',
      comments: 3,
      date: 'Sun, Dec 23',
    },
    {
      id: 3,
      time: '2 mins Read',
      imgSrc: '/assets/images/blog/blog-img3.jpg',
      user: '/assets/images/profile/user-3.jpg',
      title: 'COVID outbreak deepens as more lockdowns loom in China',
      views: '9,125',
      category: 'Health',
      comments: 12,
      date: 'Sat, Dec 23',
    },
  ];

  //   card 3
  productcards: productcards[] = [
    {
      id: 1,
      imgSrc: '/assets/images/products/s4.jpg',
      title: 'Boat Headphone',
      price: '285',
      rprice: '375',
    },
    {
      id: 2,
      imgSrc: '/assets/images/products/s5.jpg',
      title: 'MacBook Air Pro',
      price: '285',
      rprice: '375',
    },
    {
      id: 3,
      imgSrc: '/assets/images/products/s7.jpg',
      title: 'Red Valvet Dress',
      price: '285',
      rprice: '375',
    },
    {
      id: 4,
      imgSrc: '/assets/images/products/s11.jpg',
      title: 'Cute Soft Teddybear',
      price: '285',
      rprice: '375',
    },
  ];

  // card 4
  musiccards: musiccards[] = [
    {
      id: 1,
      imgSrc: '/assets/images/blog/blog-img5.jpg',
      title: 'Uptown Funk',
      subtext: 'Jon Bon Jovi',
    },
    {
      id: 2,
      imgSrc: '/assets/images/blog/blog-img4.jpg',
      title: 'Blank Space',
      subtext: 'Madonna',
    },
    {
      id: 3,
      imgSrc: '/assets/images/blog/blog-img3.jpg',
      title: 'Lean On',
      subtext: 'Jennifer Lopez',
    },
  ];

  // card 5
  followercards: followercards[] = [
    {
      id: 1,
      imgSrc: '/assets/images/profile/user-1.jpg',
      title: 'Andrew Grant',
      subtext: 'El Salvador',
    },
    {
      id: 2,
      imgSrc: '/assets/images/profile/user-2.jpg',
      title: 'Leo Pratt',
      subtext: 'Bulgaria',
    },
    {
      id: 3,
      imgSrc: '/assets/images/profile/user-3.jpg',
      title: 'Charles Nunez',
      subtext: 'Nepal',
    },
  ];

  // card 6
  friendcards: friendcards[] = [
    {
      id: 1,
      imgSrc: '/assets/images/profile/user-1.jpg',
      title: 'Andrew Grant',
    },
    {
      id: 2,
      imgSrc: '/assets/images/profile/user-2.jpg',
      title: 'Leo Pratt',
    },
    {
      id: 3,
      imgSrc: '/assets/images/profile/user-3.jpg',
      title: 'Charles Nunez',
    },
    {
      id: 4,
      imgSrc: '/assets/images/profile/user-4.jpg',
      title: 'Lora Powers',
    },
  ];

  // card 7
  socialcards: socialcards[] = [
    {
      id: 1,
      imgSrc: '/assets/images/profile/user-1.jpg',
      username: 'Andrew Grant',
      post: 'Technology Director',
    },
    {
      id: 2,
      imgSrc: '/assets/images/profile/user-2.jpg',
      username: 'Andrew Grant',
      post: 'Technology Director',
    },
    {
      id: 3,
      imgSrc: '/assets/images/profile/user-3.jpg',
      username: 'Andrew Grant',
      post: 'Technology Director',
    },
  ];

  // card 8
  giftcards: giftcards[] = [
    {
      id: 1,
      imgSrc: '/assets/images/products/s1.jpg',
      username: 'Andrew Grant',
    },
    {
      id: 2,
      imgSrc: '/assets/images/products/s2.jpg',
      username: 'Leo Pratt',
    },
    {
      id: 3,
      imgSrc: '/assets/images/products/s3.jpg',
      username: 'Charles Nunez',
    },
  ];

  // card 9
  stats: stats[] = [
    {
      id: 1,
      color: 'primary',
      title: 'Paypal',
      subtitle: 'Big Brands',
      img: 'assets/images/svgs/icon-paypal.svg',
      percent: '6235',
    },
    {
      id: 2,
      color: 'success',
      title: 'Wallet',
      subtitle: 'Bill payment',
      img: 'assets/images/svgs/icon-office-bag.svg',
      percent: '345',
    },
    {
      id: 3,
      color: 'warning',
      title: 'Credit Card',
      subtitle: 'Money reversed',
      img: 'assets/images/svgs/icon-master-card.svg',
      percent: '2235',
    },
    {
      id: 4,
      color: 'error',
      title: 'Refund',
      subtitle: 'Bill Payment',
      img: 'assets/images/svgs/icon-pie.svg',
      percent: '32',
    },
  ];

  // card 10
  stats2: stats2[] = [
    {
      id: 1,
      time: '09.30 am',
      color: 'primary',
      subtext: 'Payment received from John Doe of $385.90',
    },
    {
      id: 2,
      time: '10.30 am',
      color: 'accent',
      title: 'New sale recorded',
      link: '#ML-3467',
    },
    {
      id: 3,
      time: '12.30 pm',
      color: 'success',
      subtext: 'Payment was made of $64.95 to Michael',
    },
    {
      id: 4,
      time: '12.30 pm',
      color: 'warning',
      title: 'New sale recorded',
      link: '#ML-3467',
    },
    {
      id: 5,
      time: '12.30 pm',
      color: 'error',
      title: 'New arrival recorded',
      link: '#ML-3467',
    },
  ];

  // card 11
  id: number;
  color: string;
  title: string;
  subtitle: string;
  icon: string;
  time: string;

  activities: activities[] = [
    {
      id: 1,
      color: 'primary',
      title: 'Trip to singapore',
      subtitle: 'working on',
      icon: 'map-pin',
      time: '5 mins',
    },
     {
      id: 2,
      color: 'accent',
      title: 'Archived Data',
      subtitle: 'working on',
      icon: 'database',
      time: '10 mins',
    },
    {
      id: 3,
      color: 'warning',
      title: 'Meeting with client',
      subtitle: 'pending',
      icon: 'phone',
      time: '15 mins',
    },
    {
      id: 4,
      color: 'error',
      title: 'Screening Task Team',
      subtitle: 'pending',
      icon: 'screen-share',
      time: '20 mins',
    },
    {
      id: 5,
      color: 'success',
      title: 'Send envelope to John',
      subtitle: 'done',
      icon: 'mail',
      time: '20 mins',
    },
  ];
}
