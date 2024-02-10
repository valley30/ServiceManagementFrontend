import React, { useState } from 'react';

const PartsModal = ({ closePartsModal, addPartToRepair, partsList }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableParts, setAvailableParts] = useState(partsList);

    const filteredParts = searchTerm.length >= 3
        ? availableParts.filter(part =>
            part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.price.toString().includes(searchTerm)
        )
        : availableParts;

    const handleAddPart = async (partID) => {
        console.log("Dodawanie części z ID:", partID);
        try {
            await addPartToRepair(partID);
            const updatedParts = availableParts.filter(part => part.partID !== partID);
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
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control mb-3"
                        />
                        {filteredParts.map(part => (
                            <div key={part.partID} className="form-check">
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => handleAddPart(part.partID)}>
                                    Dodaj {part.name} - {part.price} PLN
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