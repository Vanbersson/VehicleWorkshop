import { Component, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { VisitService } from '@/app/services/crm/visit/visit.service';
import { Visit } from '@/app/models/crm/visit/visit';

export enum MapLocationType {
  SALESPERSON = 'SALESPERSON',
  CLIENT = 'CLIENT',
  AGENDA = 'AGENDA',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE'
}

export interface MapLocation {
  id: number;
  salespersonName?: string;
  clientName?:string;
  latitude: number;
  longitude: number;
  

  name: string;
  cnpj?: string;
  cpf?: string;
  type: MapLocationType;
  
  description?: string;
  dateAgenda?: string;
}

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapAdvancedMarker, FormsModule,
    ToastModule, CheckboxModule, InputTextModule, ButtonModule
  ],
  templateUrl: './regions.component.html',
  styleUrl: './regions.component.scss',
  providers: [MessageService]
})
export default class RegionsComponent {
  inputSearch: String = '';
  mapId = 'af26ded531792b8be9289b7b';
  center: google.maps.LatLngLiteral = {
    lat: -14.2350,
    lng: -51.9253
  };

  zoom = 4;

  SALESPERSON = MapLocationType.SALESPERSON;
  CLIENT = MapLocationType.CLIENT;
  AGENDA = MapLocationType.AGENDA;
  CUSTOMER_SERVICE = MapLocationType.CUSTOMER_SERVICE;

  showSalesperson = false;
  showClient = false;
  showAgenda = false;
  showCustomer = false;

  advancedMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions = { gmpDraggable: false };
  advancedMarkerPositions: google.maps.LatLngLiteral[] = [];

  private mapRef = viewChild.required<GoogleMap>(GoogleMap);

  selectMap = signal<MapLocation | null>(null);

  locationsShow = signal<MapLocation[]>([]);

  locations: MapLocation[] = [
    {
      id: 1,
      name: 'POLO, ABC1-H58',
      type: MapLocationType.SALESPERSON,
      latitude: -8.0476,
      longitude: -34.8770,
      description: 'Aristoteles Farias '
    },
    {
      id: 2,
      name: 'POLO, ABC1-D57',
      type: MapLocationType.SALESPERSON,
      latitude: -8.282429,
      longitude: -35.966685,
      description: 'Roberto Silva '
    },
    {
      id: 3,
      name: ' POLO, ABC1-D23',
      type: MapLocationType.SALESPERSON,
      latitude: -5.815775,
      longitude: -35.248297,
      description: 'Pedro Paiva',
    },
    {
      id: 4,
      name: 'TRES TRANSP RODOVIARIOS ESPECIAIS SANTIN LTDA',
      type: MapLocationType.CLIENT,
      cnpj: '123.456.789/0001-02',
      latitude: -8.0578,
      longitude: -34.8829,
      description: 'Cliente de RECIFE'
    },
    {
      id: 5,
      name: 'JOÃO PAULO',
      type: MapLocationType.CLIENT,
      cpf: '126.654.048-45',
      latitude: -8.289457,
      longitude: -35.027437,
      description: 'Cliente foi visitado por aristoteles'
    },
    {
      id: 6,
      name: 'BBM LOGISTICA S.A',
      type: MapLocationType.CLIENT,
      cpf: '126.654.048-55',
      latitude: -8.255991,
      longitude: -35.010508,
      description: 'Cliente 6'
    },
    {
      id: 7,
      name: 'BAUMINAS S.A.',
      type: MapLocationType.AGENDA,
      cnpj: '123.456.789/0001-02',
      latitude: -7.623281,
      longitude: -34.810117,
      description: 'Agenda confirmada com cliente',
      dateAgenda: '2026-11-23T14:40:51.000+00:00'
    },
    {
      id: 8,
      name: 'BBM LOGISTICA S.A',
      type: MapLocationType.CLIENT,
      cpf: '126.654.048-55',
      latitude: -7.154414,
      longitude: -34.861195,
      description: 'Cliente 8'
    },
    {
      id: 9,
      name: 'Cliente 9',
      type: MapLocationType.CLIENT,
      cnpj: '123.456.789/0001-02',
      latitude: -7.163581,
      longitude: -34.828860,
      description: 'Cliente 9'
    },
    {
      id: 10,
      name: 'BBM LOGISTICA S.A',
      type: MapLocationType.CLIENT,
      cpf: '126.654.048-55',
      latitude: -5.808432,
      longitude: -35.215338,
      description: 'Cliente Natal'
    }
  ];

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoom: 4,
    minZoom: 4,
    maxZoom: 18,
    restriction: {
      latLngBounds: {
        north: 5.5,
        south: -34.0,
        west: -74.0,
        east: -34.0
      },
      strictBounds: true
    },
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'administrative',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  constructor(private visitService: VisitService,
    private messageService: MessageService) { }

  addAdvancedMarker(event: google.maps.MapMouseEvent) {
    this.advancedMarkerPositions.push(event?.latLng!.toJSON());
  }

  changeLocation(item: MapLocation) {
    //Aplica o zoom
    if (this.mapRef().googleMap?.getZoom() != 12) {
      this.mapRef().googleMap?.setZoom(12)
    }
    this.mapRef().panTo({ lat: item.latitude, lng: item.longitude });
    this.selectMap.set(item);
  }

  updateLocationsShow(): void {
    let types = [];

    if (this.showSalesperson) {
      types.push(this.SALESPERSON);
    }

    if (this.showClient) {
      types.push(this.CLIENT);
    }

    if (this.showAgenda) {
      types.push(this.AGENDA);
    }

    if (this.showCustomer) {
      types.push(this.CUSTOMER_SERVICE);
    }

    this.locationsShow.set(this.locations.filter(
      location => types.includes(location.type)
    ));

    this.inputSearch = '';
  }

  onCheckboxChangeSalesperson(event: CheckboxChangeEvent): void {
    this.showSalesperson = event.checked;
    this.updateLocationsShow();
  }

  onCheckboxChangeClient(event: CheckboxChangeEvent): void {
    this.showClient = event.checked;
    this.updateLocationsShow();
  }

  onCheckboxChangeAgenda(event: CheckboxChangeEvent): void {
    this.allAgenda();

    this.showAgenda = event.checked;
    this.updateLocationsShow();
  }
  private async allAgenda() {
    await this.listAllAgenda();
  }

  onCheckboxChangeCustomer(event: CheckboxChangeEvent): void {
    this.showCustomer = event.checked;
    this.updateLocationsShow();
  }

  searchMap() {
    const value = this.inputSearch.trim().toLowerCase();
    // Se estiver vazio, restaura os itens marcados imediatamente
    if (!value) {
      this.updateLocationsShow();
      return;
    }
    this.updateLocationsShow();
    this.locationsShow.set(this.locationsShow().filter(location =>
      location.name.toLowerCase().includes(value) ||
      location.cnpj?.includes(value) ||
      location.cpf?.includes(value) ||
      location.description?.toLowerCase().includes(value)
    ));
  }

  private async listAllAgenda(): Promise<Visit[]> {
    try {
      return await lastValueFrom(this.visitService.listAllAgenda());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

}
