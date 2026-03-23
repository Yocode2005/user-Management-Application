import React from "react";
import Modal from "./Modal";
import Spinner from "./Spinner";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false, loading = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-slate-400 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      <button
        className={danger ? "btn-danger" : "btn-primary"}
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? <Spinner size="sm" /> : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
