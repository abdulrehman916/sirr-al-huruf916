// ═══════════════════════════════════════════════════════════════
// ASTRO BATCH THUMBNAIL GRID — Drag-and-drop reorderable page list
// Shows numbered thumbnails with rotate/remove controls (review stage)
// and status overlays (processing stage).
// ═══════════════════════════════════════════════════════════════
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RotateCw, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  uploading: { Icon: Loader2, color: '#F5D060', spin: true },
  analyzing: { Icon: Loader2, color: '#F5D060', spin: true },
  done: { Icon: CheckCircle2, color: 'rgba(74,222,128,0.80)' },
  duplicate: { Icon: CheckCircle2, color: 'rgba(212,175,55,0.70)' },
  rejected: { Icon: AlertCircle, color: 'rgba(248,113,113,0.50)' },
  error: { Icon: AlertCircle, color: 'rgba(248,113,113,0.80)' },
};

export default function AstroBatchThumbnailGrid({ pages, onReorder, onRemove, onRotate, disabled }) {
  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="batch-pages" direction="horizontal" isDropDisabled={disabled}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 min-h-[68px]"
          >
            {pages.map((page, index) => {
              const cfg = STATUS_CONFIG[page.status];
              const showStatus = cfg && page.status !== 'pending';
              return (
                <Draggable key={page.id} draggableId={page.id} index={index} isDragDisabled={disabled}>
                  {(prov) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className="flex-shrink-0 relative"
                      style={{ ...prov.draggableProps.style }}
                    >
                      {/* Page number badge */}
                      <div className="absolute top-0.5 left-0.5 z-20 px-1 rounded font-inter text-[8px] font-bold"
                        style={{ background: 'rgba(0,0,0,0.70)', color: '#F5D060' }}>
                        {index + 1}
                      </div>

                      {/* Thumbnail image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden relative" style={{
                        border: '1px solid rgba(212,175,55,0.20)',
                        background: 'rgba(255,255,255,0.03)',
                      }}>
                        {page.thumbnailUrl ? (
                          <img src={page.thumbnailUrl} alt="" className="w-full h-full object-cover"
                            style={{ transform: `rotate(${page.rotation}deg)` }} />
                        ) : null}

                        {/* Status overlay */}
                        {showStatus && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.55)' }}>
                            <cfg.Icon className={cfg.spin ? 'w-5 h-5 animate-spin' : 'w-5 h-5'}
                              style={{ color: cfg.color }} />
                          </div>
                        )}
                      </div>

                      {/* Rotate + Remove controls (review stage only) */}
                      {!disabled && (
                        <div className="absolute -top-1 -right-1 flex gap-0.5 z-30">
                          <button
                            onClick={(e) => { e.stopPropagation(); onRotate(page.id); }}
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(212,175,55,0.35)' }}
                          >
                            <RotateCw className="w-2.5 h-2.5" style={{ color: '#F5D060' }} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemove(page.id); }}
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(248,113,113,0.35)', border: '1px solid rgba(248,113,113,0.55)' }}
                          >
                            <X className="w-2.5 h-2.5" style={{ color: 'rgba(248,113,113,0.95)' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}