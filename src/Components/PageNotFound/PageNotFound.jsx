import notFound from "../../Assets/Common/error-page.svg"

import "./PageNotFound.css"

export default function PageNotFound() {
    return(
        <section id="pagenotfound" className="pagenotfound container1">
            <div className="notfound">
                <img src={notFound} alt="Page Not Found"/>
                <h1>This page doesn't seem to exist.</h1>
                We searched high and low but couldn’t find what you’re
                looking for. Let’s find a better place for you to go.
                <div>
                    <a href="/">
                        <button className="btn-glass-dark">Back To Home
                            <span className="line">
                                <span className="circle"></span>
                            </span>
                        </button>
                    </a>
                </div>
            </div>
        </section>
    )
}