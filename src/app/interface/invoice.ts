
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
}

export interface FirmList {
    id: string,
    header: string,
    subHeader: string,
    address: string,
    gstNo: string,
    gstpercentage: number,
    panNo: string,
    mobileNo: number,
    personalMobileNo: number,
    bankName: string,
    bankIfsc: string,
    bankAccountNo: number,
    userId :any

}

export interface ProductList {

    id: string,
    productName: string,
    userId :any

}