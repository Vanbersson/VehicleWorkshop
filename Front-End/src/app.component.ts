import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Loading } from './app/components/loading/loading';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, Loading],
    template: `
    <app-loading/>
    <router-outlet></router-outlet>
    `
})
export class AppComponent {

    constructor() {
    }
}
