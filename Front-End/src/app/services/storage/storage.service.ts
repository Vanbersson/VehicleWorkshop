import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  constructor() { }

  set companyId(companyId: string) {
    localStorage.setItem('companyId', companyId);
  }
  get companyId(): number {
    return Number.parseInt(localStorage.getItem("companyId")!);
  }

  set resaleId(resaleId: string) {
    localStorage.setItem('resaleId', resaleId);
  }
  get resaleId(): number {
    return Number.parseInt(localStorage.getItem("resaleId")!);
  }

  set id(id: string) {
    localStorage.setItem('id', id);
  }
  get id(): number {
    return Number.parseInt(localStorage.getItem("id")!);
  }

  set name(name: string) {
    localStorage.setItem('name', name);
  }
  get name(): string {
    return localStorage.getItem("name")!;
  }

  set email(email: string) {
    localStorage.setItem('email', email);
  }
  get email(): string {
    return localStorage.getItem("email")!;
  }

  set cellphone(cellphone: string) {
    localStorage.setItem('cellphone', cellphone);
  }
  get cellphone(): string {
    return localStorage.getItem("cellphone")!;
  }

  set limitDiscount(limitDiscount: string) {
    localStorage.setItem('limitDiscount', limitDiscount);
  }
  get limitDiscount(): number {
    return Number.parseInt(localStorage.getItem("limitDiscount")!);
  }

  set photo(photo: string) {
    localStorage.setItem('photo', photo);
  }
  get photo(): string {
    return localStorage.getItem("photo")!;
  }

  set roleDesc(roleDesc: string) {
    localStorage.setItem('roleDesc', roleDesc);
  }
  get roleDesc(): string {
    return localStorage.getItem("roleDesc")!;
  }

  set roleFunc(roleFunc: string) {
    localStorage.setItem('roleFunc', roleFunc);
  }
  get roleFunc(): string {
    return localStorage.getItem("roleFunc")!;
  }

  set token(token: string) {
    localStorage.setItem('token', token);
  }
  get token(): string {
    return localStorage.getItem("token")!;
  }

  set menus(menus: string) {
    localStorage.setItem('menus', menus);
  }
  get menus(): string {
    return localStorage.getItem("menus")!;
  }

  set permissions(per: string) {
    localStorage.setItem('permission', per);
  }
  get permissions(): string {
    return localStorage.getItem("permission")!;
  }  

}
