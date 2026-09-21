import { Injectable } from '@angular/core';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Platform } from '@angular/cdk/platform';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';


@Injectable({
    providedIn: 'root'
})
export class PhotoService {

    constructor(private platform: Platform, private ngxImageCompressService: NgxImageCompressService) { }

    async takePicture(): Promise<IPhotoResult> {
        if (this.platform.ANDROID || this.platform.IOS) {
            return await this.takeMobilePicture();
        }
        //Browser
        return await this.takeMobilePicture();
    }

    // -----------------------------------------
    // MOBILE (CAPACITOR)
    // -----------------------------------------

    private async takeMobilePicture(): Promise<IPhotoResult> {
        try {
            const photo = await Camera.getPhoto({
                quality: 50,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera,
            });
            // dataUrl que o compressor precisa
            const imageDataUrl = `data:image/${photo.format};base64,${photo.base64String}`;

            // Orientação padrão
            const orientation = -1;

            // Comprime a imagem
            const compressedImage = await this.ngxImageCompressService.compressFile(
                imageDataUrl,
                orientation,
                50,   // qualidade
                40    // proporção
            );
            return {
                status: StatusPhotoResult.SUCCESS,
                base64: compressedImage
            };
        } catch (error) {
            return { status: StatusPhotoResult.ERROR };
        }
    }

    get maxSise(): number {
        return 5 * 1024 * 1024; //Tamanho máximo permitido 5M
    }

    get maxSiseLabel(): string {
        return "Tamanha máximo 5MB";
    }

}