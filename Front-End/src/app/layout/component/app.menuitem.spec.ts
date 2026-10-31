import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { LayoutService } from '@/app/layout/service/layout.service';

describe('Sidebar submenu accessibility', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [AppMenuitem], providers: [provideRouter([])] }));
    it('opens and closes a submenu with the keyboard', () => {
        const fixture = TestBed.createComponent(AppMenuitem);
        fixture.componentRef.setInput('item', { label: 'Cadastros', path: '/register', items: [{ label: 'Marcas', routerLink: ['/config/register/brand'] }] });
        fixture.componentRef.setInput('parentPath', '/config');
        const component = fixture.componentInstance;
        const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
        component.toggleFromKeyboard(enter);
        expect(enter.defaultPrevented).toBeTrue();
        expect(TestBed.inject(LayoutService).layoutState().activePath).toBe('/config/register');
        expect(component.isActive()).toBeTrue();
        component.toggleFromKeyboard(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
        expect(component.isActive()).toBeFalse();
    });
    it('does not open a disabled submenu or intercept keyboard navigation on a leaf link', () => {
        const fixture = TestBed.createComponent(AppMenuitem);
        fixture.componentRef.setInput('item', { label: 'Cadastros', disabled: true, path: '/register', items: [{ label: 'Marcas' }] });
        fixture.componentInstance.toggleFromKeyboard(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
        expect(TestBed.inject(LayoutService).layoutState().activePath).toBeNull();
        fixture.componentRef.setInput('item', { label: 'Marcas', routerLink: ['/config/register/brand'] });
        const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
        fixture.componentInstance.toggleFromKeyboard(event);
        expect(event.defaultPrevented).toBeFalse();
    });
    it('keeps unauthorized menu items hidden', () => {
        const fixture = TestBed.createComponent(AppMenuitem);
        fixture.componentRef.setInput('item', { label: 'Restrito', visible: false, routerLink: ['/config/register/user'] });
        fixture.detectChanges();
        expect(fixture.nativeElement.classList.contains('menuitem-hidden')).toBeTrue();
        expect(fixture.nativeElement.querySelector('a')).toBeNull();
    });
});
