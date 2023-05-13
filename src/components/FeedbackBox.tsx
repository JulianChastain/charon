import React from "react";

export function FeedbackBox({
                         children
                     }
                         :
                         {
                             children: string
                         }
):
    JSX.Element {
    return (
        <div
            className={'rowItem'}
            style={{
                borderStyle: 'solid',
            }}
        >
            {children}
        </div>
    );
}
