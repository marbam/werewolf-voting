import React from 'react';
import ReactDOM from 'react-dom';

function PlayerRow(props) {
    return (
        <div>
            <label>Name: <input></input></label>
            <label>Role:
                <select>
                    <option value="">Select...</option>
                    {
                        props.roles.map(role =>
                            <option value={role.id} key={role.id}>{role.name}</option>
                        )
                    }
                </select>
            </label>
        </div>
    );
}

export default PlayerRow;