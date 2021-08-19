import React, { useState, createRef, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import MultiToggle from "react-multi-toggle"

import './assets/css/style.scss';
import {
    ReplyIcon,
    RetweetIcon,
    LikeIcon,
    ShareIcon,
    VerifiedIcon
} from './assets/icons';
import { useScreenshot } from 'use-react-screenshot';
import { languages } from './lang/language';

function convertImgToBase64(url, callback, outputFormat) {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        // Clean up
        canvas = null;
    };
    img.src = url;
}

const tweetFormat = tweet => {
    tweet = tweet
        .replace(/@([\w]+)/g, '<span>@$1</span>')
        .replace(/#([\wşçöğüıİ]+)/gi, '<span>#$1</span>')
        .replace(/(https?:\/\/[\w\.\/]+)/, '<span>$1</span>')
        .replace(/\n/g, '<br />');
    return tweet;
};

const formatNumber = number => {
    if (!number) {
        number = 0;
    }
    if (number < 1000) {
        return number;
    }
    number /= 1000;
    number = String(number).split('.');

    return (
        number[0] + (number[1] > 100 ? ',' + number[1].slice(0, 1) + ' B' : ' B')
    );
};

export default function App() {
    const tweetRef = createRef(null);
    const downloadRef = createRef();
    const [name, setName] = useState();
    const [username, setUsername] = useState();
    const [isVerified, setIsVerified] = useState(0);
    const [tweet, setTweet] = useState();
    const [avatar, setAvatar] = useState();
    const [retweets, setRetweets] = useState(0);
    const [quoteTweets, setQuoteTweets] = useState(0);
    const [likes, setLikes] = useState(0);
    const [lang, setLang] = useState('en');
    const [image, takeScreenshot] = useScreenshot();
    const [langText, setLangText] = useState();
    const getImage = () => takeScreenshot(tweetRef.current);
    const [theme, setTheme] = useState("theme-default");
    const  onGroupSizeSelect = value => {setTheme(value)
        console.log(theme)
    };

    useEffect(() => {
        setLangText(languages[lang]);
    }, [lang]);

    useEffect(() => {
        if (image) {
            downloadRef.current.click();
        }
    }, [image]);

    const avatarHandle = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', function() {
            setAvatar(this.result);
        });
        reader.readAsDataURL(file);
    };
    const groupOptions = [
        {
            displayName: langText?.theme_default,
            value: "theme-default"
        },
        {
            displayName: langText?.theme_dif,
            value: "theme-dim"
        },
        {
            displayName: langText?.theme_lights_out,
            value: "theme-lights-out"
        },
    ];

    const fetchTwitterInfo = () => {
        fetch(
            `https://typeahead-js-twitter-api-proxy.herokuapp.com/demo/search?q=${username}`
        )
            .then(res => res.json())
            .then(data => {
                const twitter = data[0];
                const pp = twitter.profile_image_url_https.replace("_normal", "");
                convertImgToBase64(pp, function(
                    base64Image
                ) {
                    setAvatar(base64Image);
                });

                setName(twitter.name);
                setUsername(twitter.screen_name);
                setTweet(twitter.status.text);
                setRetweets(twitter.status.retweet_count);
                setLikes(twitter.status.favorite_count);
            });
    };

    return (
        <>
            <div className={ "main " + theme }>
                <div className="app-language">

          <span
              onClick={() => setLang('tr')}
              className={lang === 'tr' && 'active'}
          >
              TR <img style={{height:"48px"}} src={require("./assets/img/turkey.png").default} />
          </span>
                    <span
                        onClick={() => setLang('en')}
                        className={lang === 'en' && 'active'}
                    >
            ENG <img style={{height:"48px"}} src={require("./assets/img/usa.png").default} />
          </span>
                </div>
                <h3 className="title">{ langText?.title }</h3>
                <MultiToggle
                    options={groupOptions}
                    selectedOption={theme}
                    onSelectOption={onGroupSizeSelect}
                    label={langText?.select_theme}
                />
                <div className="get-info">
<Row>
    <label>{ langText?.get_data }</label>
</Row>
                <Row>
                    <input
                        type="text"
                        value={username}
                        placeholder={ langText?.username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <button onClick={fetchTwitterInfo}>{ langText?.get}</button>
                </Row>
                </div>

                <div className="tweet-container">

                    <div className="tweet" ref={tweetRef}>
                        <div className="tweet-author">
                            {(avatar && <img src={avatar} />) ||<img src={require("./assets/img/default_profile.png").default} />}
                            <div>
                                <div className="name">
                                    <span>{name || 'Ad Soyad'}</span>
                                    {isVerified == 1 && <VerifiedIcon width="19" height="19" />}
                                </div>
                                <div className="username">@{username || 'kullaniciadi'}</div>
                            </div>
                        </div>
                        <div className="tweet-content">
                            <text
                                dangerouslySetInnerHTML={{
                                    __html:
                                        (tweet && tweetFormat(tweet)) ||
                                        'Merhaba, bugün nasılsın? '
                                }}
                            />
                        </div>
                        <div className="tweet-stats">
            <span>
              <b>{formatNumber(retweets)}</b> Retweet
            </span>
                            <span>
              <b>{formatNumber(quoteTweets)}</b> { langText?.quoteTweet}
            </span>
                            <span>
              <b>{formatNumber(likes)}</b> { langText?.like }
            </span>
                        </div>
                        <div className="tweet-actions">
            <span>
              <ReplyIcon />
            </span>
                            <span>
              <RetweetIcon />
            </span>
                            <span>
              <LikeIcon />
            </span>
                            <span>
              <ShareIcon />
            </span>
                        </div>
                    </div>
                </div>

                <div className="tweet-settings">
                    <Row>
                        <Col sm={{ size: 'auto', offset: 1 }}>
                            <h3>{langText?.settings}</h3>
                        </Col></Row>

                    <Row style={{marginBottom:"10px"}}>
                        <Col md="4">
                            <label>{ langText?.pic}</label>
                            <input type="file" className="input" onChange={avatarHandle} /></Col>
                        <Col md="4">    <label>{ langText?.name }</label>
                            <input
                                type="text"
                                className="input"
                                value={ name }
                                onChange={ e => setName(e.target.value) }
                            /></Col>
                        <Col md="4">
                            <label>{ langText?.username }</label>
                            <input
                                type="text"
                                className="input"
                                value={ username }
                                onChange={ e => setUsername(e.target.value) }
                            />
                        </Col>
                    </Row>

                    <Row style={{marginBottom:"10px"}}>
                        <Col md="12">
                            <label>Tweet</label>
                            <textarea
                                className="textarea"
                                maxLength="280"
                                value={ tweet }
                                onChange={ e => setTweet(e.target.value) }
                            />
                        </Col>

                    </Row>

                    <Row style={{marginBottom:"10px"}}>
                        <Col md="4">
                            <label>{ langText?.verified}</label>
                            <select
                                onChange={e => setIsVerified(e.target.value)}
                                defaultValue={isVerified}
                            >
                                <option value="1">{langText?.yes }</option>
                                <option value="0">{langText?.no}</option>
                            </select></Col>
                        <Col md="3">
                            <label>Retweet</label>
                            <input
                                type="number"
                                className="input"
                                value={retweets}
                                onChange={e => setRetweets(e.target.value)}
                            />
                        </Col>
                        <Col md="3">

                            <label>{ langText?.quoteTweet}</label>
                            <input
                                type="number"
                                className="input"
                                value={quoteTweets}
                                onChange={e => setQuoteTweets(e.target.value)}
                            />

                        </Col>
                        <Col md="2">
                            <label>{ langText?.like}</label>
                            <input
                                type="number"
                                className="input"
                                value={likes}
                                onChange={e => setLikes(e.target.value)}
                            />
                        </Col>


                    </Row>

                    <center>
                        <button onClick={getImage}>{ langText?.create}</button>
                    </center>

                    <div className="download-url">
                        {image && (
                            <a ref={downloadRef} href={image} download="tweet.png">
                                Tweeti İndir
                            </a>
                        )}
                    </div>

                </div>
                <div className="footer-bottom">
                        <Row style={{margin:"0px"}}>
                            <div className="col-lg-12 text-center"><span> Made with <i
                                className="fa fa-heart m-lr5 text-red heart"></i> by <a href="https://www.serdarbudak.com.tr"> Serdar Budak </a></span>


                            </div>
                        </Row>
                </div>
            </div>


        </>
    );
}
