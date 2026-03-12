import {
  Directive,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  Renderer2,
} from '@angular/core';

/**
 * DragListDirective — attach to a container, each child with [draggable="true"]
 * and [data-drag-id] will be draggable. Emits reordered id array on drop.
 *
 * Usage:
 *   <div appDragList (reordered)="onReorder($event)">
 *     <div draggable="true" [attr.data-drag-id]="item.id" *ngFor="...">
 */
@Directive({ selector: '[appDragList]', standalone: true })
export class DragListDirective {
  @Output() reordered = new EventEmitter<string[]>();

  private dragSrcId: string | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  private getItems(): HTMLElement[] {
    return Array.from(this.el.nativeElement.querySelectorAll('[data-drag-id]'));
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(e: DragEvent) {
    const target = (e.target as HTMLElement).closest('[data-drag-id]') as HTMLElement;
    if (!target) return;
    this.dragSrcId = target.dataset['dragId'] || null;
    this.renderer.addClass(target, 'dragging');
    e.dataTransfer!.effectAllowed = 'move';
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(e: DragEvent) {
    this.getItems().forEach((el) => {
      this.renderer.removeClass(el, 'dragging');
      this.renderer.removeClass(el, 'drag-over');
    });
  }

  @HostListener('dragover', ['$event'])
  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    const target = (e.target as HTMLElement).closest('[data-drag-id]') as HTMLElement;
    this.getItems().forEach((el) => this.renderer.removeClass(el, 'drag-over'));
    if (target && target.dataset['dragId'] !== this.dragSrcId) {
      this.renderer.addClass(target, 'drag-over');
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(e: DragEvent) {
    const target = (e.target as HTMLElement).closest('[data-drag-id]') as HTMLElement;
    if (target) this.renderer.removeClass(target, 'drag-over');
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    e.preventDefault();
    const target = (e.target as HTMLElement).closest('[data-drag-id]') as HTMLElement;
    if (!target || !this.dragSrcId) return;

    const destId = target.dataset['dragId'];
    if (destId === this.dragSrcId) return;

    // Reorder the actual DOM items to get new sequence
    const items = this.getItems();
    const ids = items.map((el) => el.dataset['dragId'] as string);
    const srcIdx = ids.indexOf(this.dragSrcId);
    const dstIdx = ids.indexOf(destId!);
    if (srcIdx < 0 || dstIdx < 0) return;

    ids.splice(srcIdx, 1);
    ids.splice(dstIdx, 0, this.dragSrcId);

    this.reordered.emit(ids);
    this.dragSrcId = null;
    this.getItems().forEach((el) => this.renderer.removeClass(el, 'drag-over'));
  }
}
