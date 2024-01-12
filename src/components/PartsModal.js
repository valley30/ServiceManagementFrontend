import React, { useState } from 'react';

const PartsModal = ({ closePartsModal, addPartToRepair, partsList }) => {
    const [availableParts, setAvailableParts] = useState(partsList);

    const handleAddPart = async (partpartID) => {
        console.log("Dodawanie części z ID:", partpartID); // Dodaj to, aby zobaczyć, czy ID części jest prawidłowe
        try {
            await addPartToRepair(partpartID);
            const updatedParts = availableParts.filter(part => part.partID !== partpartID);
            setAvailableParts(updatedParts);
        } catch (error) {
            console.error('Error adding part to repair:', error);

        }
    };
    return (
        <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Wybierz części</h5>
                        <button type="button" className="btn-close" onClick={closePartsModal}></button>
                    </div>
                    <div className="modal-body">
                        {partsList.map(part => (
                            <div key={part.partID} className="form-check">
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => addPartToRepair(part.partID)}>
                                    Dodaj  {part.name} - {part.price} PLN
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closePartsModal}>Ok</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartsModal;