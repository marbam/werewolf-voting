import React from 'react';
import ReactDOM from 'react-dom';

function PlayerRow (props) {

    return (
        <div>
            <label>Name:
                </label>
                <input
                    value={props.name}
                    onChange={() => props.nameC(props.index)}
                >
                </input>
            <label>Role:
                <select value={props.selectedRole} onChange={() => props.roleC(props.index)}>
                    <option value="">Select...</option>
                    {
                        props.roles.map(role =>
                            <option
                                value={role.id}
                                key={role.id}
                            >{role.name}</option>
                        )
                    }
                </select>
            </label>
        </div>
    );

}

export default PlayerRow;