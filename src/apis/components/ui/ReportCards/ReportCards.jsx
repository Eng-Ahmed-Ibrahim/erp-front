import React from 'react'
import { API_ENDPOINT } from '../../../../config'
import './ReportCards.scss'

function ReportCards(props) {
    // console.log(props)
    return (


        <div className="custom-card-rest" onClick={props.onClick}>
            <div className='image-rest'>
                <img className='card-img-rest' src={`${props.img}`} alt={`alt-${props.name}`} />
            </div>
            <div className='details-rest'>
                <h1>{props.department} </h1>
            </div>
        </div>

    )
}

export default ReportCards