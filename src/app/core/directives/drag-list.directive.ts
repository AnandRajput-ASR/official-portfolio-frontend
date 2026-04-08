import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
  inject,
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
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() dragHandleSelector: string | null = null;

  @Output() reordered = new EventEmitter<string[]>();

  private dragSrcId: string | null = null;
  private lastPointerDownTarget: HTMLElement | null = null;

  private getItems(): HTMLElement[] {
    return Array.from(this.el.nativeElement.querySelectorAll('[data-drag-id]'));
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    this.lastPointerDownTarget = e.target as HTMLElement;
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(e: DragEvent) {
    const dragTarget = e.target as HTMLElement;
    const dragOrigin = this.lastPointerDownTarget || dragTarget;

    const isInteractive = !!dragOrigin.closest(
      'input, textarea, select, button, a, label, [contenteditable="true"]',
    );
    if (isInteractive) {
      e.preventDefault();
      return;
    }

    const target = dragTarget.closest('[data-drag-id]') as HTMLElement;
    if (!target) return;

    if (this.dragHandleSelector) {
      const handle = dragOrigin.closest(this.dragHandleSelector);
      if (!handle || !target.contains(handle)) {
        e.preventDefault();
        return;
      }
    }

    this.dragSrcId = target.dataset['dragId'] || null;
    this.renderer.addClass(target, 'dragging');
    e.dataTransfer!.effectAllowed = 'move';
    // Some browsers require setData for drag/drop to start reliably.
    e.dataTransfer?.setData('text/plain', this.dragSrcId || '');
  }

  @HostListener('dragend')
  onDragEnd() {
    this.lastPointerDownTarget = null;
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
    const srcId = this.dragSrcId || e.dataTransfer?.getData('text/plain') || null;
    if (!target || !srcId) return;

    const destId = target.dataset['dragId'];
    if (destId === srcId) return;

    // Reorder the actual DOM items to get new sequence
    const items = this.getItems();
    const ids = items.map((el) => el.dataset['dragId'] as string);
    const srcIdx = ids.indexOf(srcId);
    const dstIdx = ids.indexOf(destId!);
    if (srcIdx < 0 || dstIdx < 0) return;

    ids.splice(srcIdx, 1);
    ids.splice(dstIdx, 0, srcId);

    this.reordered.emit(ids);
    this.dragSrcId = null;
    this.lastPointerDownTarget = null;
    this.getItems().forEach((el) => this.renderer.removeClass(el, 'drag-over'));
  }
}
