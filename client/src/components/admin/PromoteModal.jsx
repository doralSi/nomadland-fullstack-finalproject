const PromoteModal = ({ 
  regions, 
  selectedRegions, 
  onToggleRegion, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Promote to Map Ranger</h2>
        <p>Select regions this Map Ranger will manage:</p>
        <div className="regions-checklist">
          {regions.map((region) => (
            <label key={region.slug} className="region-checkbox">
              <input
                type="checkbox"
                checked={selectedRegions.includes(region.slug)}
                onChange={(e) => onToggleRegion(region.slug, e.target.checked)}
              />
              <span>{region.name}</span>
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-confirm">
            Promote
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoteModal;
