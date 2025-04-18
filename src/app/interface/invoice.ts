
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

export interface ProductList {
    id: string,
    productName: string,
    userId :any
}

export interface PurchaseList {
    id: any,
    userId: any,
    productUniqueNumber: number,
    productid: any,
    productDes: any,
    productDate: any,
    productSize: any,
    purchaseAmount: number,
    shellDiscount: number,
    shellAmount: number | null,
    productProfit: number,
    customerName: string,
    customerNumber: number,
    isShell: boolean,
    createDate: any,
    finalAmount: number,
    invoiceNo: number,
    invoiceDate: any,
    firmName: string,
    firmAddress: string,
    invoiceStatus: string,

}
