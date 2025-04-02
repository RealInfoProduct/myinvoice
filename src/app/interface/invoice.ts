
export interface AuthResponse {
    idToken:string,
    email:string,
    refreshToken:string,
    expiresIn:string,
    localId:string
    registerd?:boolean
}

export interface RegisterUser {
    id:string,
    email:any,
    password: any,
    isActive :boolean
}

export interface PartyList {
    id: string,
    partyName: string,
    partyAddress: string,
    partyGstNo: string,
    partyChalanNoSeries: number,
    partyPanNo: string,
    partyMobileNo: number,
    userId :any
    isFirm:any
}

export interface FirmList {
    id: string,
    header: string,
    subHeader: string,
    address: string,
    gstNo: string,
    // gstpercentage: number,
    panNo: string,
    mobileNo: number,
    personalMobileNo: number,
    bankName: string,
    accountholdersname: string; 
    bankIfsc: string,
    bankAccountNo: number,
    userId :any,
    isInvoiceTheme : number

}

export interface ProductList {
    id: string,
    productName: string,
    userId :any
}

export interface InvoiceList {
    id:string
    accountYear: string
    cGST: any
    date: string
    discount: number;
    invoiceNumber: number;
    sGST: number;
    firmId: any;
    partyId: any;
    products: any;
    userId :any;
    finalSubAmount:any,
    isPayment : boolean,
    receivePayment : any

}
