import React, { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import './MapPage.css';
import useAddSpot from "../hooks/useAddSpot";
import { useUploadPhotos } from "../hooks/useUpload";
import useSubtypeLibrary from "../hooks/useSubtypes";
import useSpotReview from "../hooks/useSpotReview";
import useSeasonReports from "../hooks/useReports";
import CreatableSelect from "react-select/creatable";
const API_BASE = import.meta.env.VITE_API_BASE;

// Import Custom Hooks
import useMap from "../hooks/useMap";
import useRailways from "../hooks/useRailways";
import useHanabiEvents from "../hooks/useHanabiEvents";
import useSpotMarkers from "../hooks/useSpotMarkers";

export default function MapPage() {
    // --- Refs & State ---
    const mapContainer = useRef(null);
    const [spots, setSpots] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const [showPhotoInfo, setShowPhotoInfo] = useState(false);
    const [showAccessRules, setShowAccessRules] = useState(false);
    const [selectedHanabi, setSelectedHanabi] = useState("");
    const [panelState, setPanelState] = useState("half");
    const [showAddReview, setShowAddReview] = useState(false);
    const [showSeasonReports, setShowSeasonReports] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [seasonForm, setSeasonForm] = useState({
        status: "",
        note: "",
        date: ""
    });


    const markerIcons = {
        hanabi: "https://res.cloudinary.com/dz2xri489/image/upload/v1764618894/Image_3_bug7ov.png",
        toritetsu: "https://res.cloudinary.com/dz2xri489/image/upload/v1764621671/Image_4_d8ozmy.png",
        seasonal: "https://res.cloudinary.com/dz2xri489/image/upload/v1764618894/Image_5_hxanim.png",
        hanabiEvent: "https://res.cloudinary.com/dz2xri489/image/upload/v1765306226/ha_vjjb59.png",
        hanabiRed: "https://res.cloudinary.com/dz2xri489/image/upload/v1765312141/Image_8_h9s3mw.png"
    };
    const focalLengthMap = {
        "超広角": "ultra_wide",
        "広角": "wide",
        "標準": "standard",
        "望遠": "telephoto",
        "超望遠": "super_telephoto"
    };

    const { uploadPhotos } = useUploadPhotos();
    const { subtypeLibrary, loadSubtypes, createSubtype } = useSubtypeLibrary();
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    const {
        reviews, userReview, setUserReview,
        ratingSummary,
        fetchReviews,
        addReview,
        updateReview, handleUserReviewChange,
        deleteReview
    } = useSpotReview(token);
    const {
        loading,
        addSeasonReport,
        updateSeasonReport,
        deleteSeasonReport
    } = useSeasonReports(token)

    const {
        adding, startAdding, cancelAdding, tempCoords, setCoordinates,
        formData, setFormData, handleChange, submitSpot
    } = useAddSpot(token);

    // Maintain a ref for adding status to pass to hooks (avoids stale closures)
    const addingRef = useRef(adding);
    useEffect(() => { addingRef.current = adding }, [adding]);

    // --- 1. Map Initialization Hook ---
    const { mapRef, flyToUserLocation, flyToPlace } = useMap(mapContainer, addingRef, setCoordinates, setSelectedSpot);

    // --- 2. Railway Logic Hook ---
    // Returns selectedLine if you need it, but it handles its own internal state mostly
    useRailways(mapRef, filter, setFilter, addingRef);

    // --- 3. Hanabi Events Hook ---
    useHanabiEvents(mapRef, filter, selectedHanabi, setSelectedHanabi, markerIcons.hanabiEvent);

    // --- 4. Spot Markers Hook ---
    useSpotMarkers(mapRef, spots, filter, selectedHanabi, setSelectedHanabi, setSelectedSpot, markerIcons);

    // 5. Review Hook
    useEffect(() => {
        if (selectedSpot?._id) {
            fetchReviews(selectedSpot._id);
        }
    }, [selectedSpot, fetchReviews]);
    // inside MapPage component
    const latestReport = useMemo(() => {
        const reports = selectedSpot?.seasonReports;
        if (!reports || reports.length === 0) {
            return { status: 0, date: null, note: "" };
        }
        const sorted = [...reports].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );
        return sorted[0];
    }, [selectedSpot]);




    // --- Fetch Spots Data ---
    useEffect(() => {
        const loadSpots = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/spots`);
                setSpots(data);
            } catch (err) {
                console.error("Failed to load spots:", err);
            }
        };
        loadSpots();
    }, []);

    // --- Load Subtypes when form type changes ---
    useEffect(() => {
        if (formData.type) loadSubtypes(formData.type);
    }, [formData.type, loadSubtypes]);


    const handleFilterClick = (type) => {
        setFilter(type);
        setSelectedSpot(null);
        setSelectedHanabi("");
        if (window.innerWidth < 900) setIsFilterOpen(false);
    };
    console.log(selectedSpot);

    return (
        <div className="map-page-container">
            <div ref={mapContainer} className="map-container" />

            {/* Selected Spot Info Panel */}
            {selectedSpot && (
                <div className={`bottom-info-panel ${panelState}`}>
                    <div className="panel-handle" onClick={() =>
                        setPanelState(prev => (prev === "half" ? "full" : "half"))
                    } />

                    <div className="panel-content">
                        <button className="close-btn" onClick={() => setSelectedSpot(null)}>✕</button>
                        <div className="spot-title-row">
                            <h2 className="spot-title">{selectedSpot.name}</h2>
                            {selectedSpot.type == "seasonal" && (
                                <button
                                    className={`season-chip ${latestReport.status}`}
                                    onClick={() => setShowSeasonReports(true)}
                                >
                                    {["見頃情報なし", "序盤", "見頃前", "見頃", "後半", "見頃後"][latestReport.status + 0]}
                                </button>
                            )}


                        </div><div className="spot-title-row">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.location.coordinates[1]},${selectedSpot.location.coordinates[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="gmaps-button"
                            >
                                Google Mapsで開く
                            </a>
                            {selectedSpot.type == "seasonal" && (
                                <a style={{ fontSize: '11px' }}>
                                    最新報告日:{latestReport?.date?.slice(0, 10)}
                                </a>
                            )}
                        </div>

                        <p>
                            <b>Type:</b> {selectedSpot.type}
                            {selectedSpot.subtype && <> <b>:</b> {selectedSpot.subtype}</>}
                        </p>

                        {selectedSpot.photos?.length > 0 ? (
                            <div className="carousel-container">
                                <div className="carousel-wrapper">
                                    {selectedSpot.photos.map((photo, index) => (
                                        <img key={index} src={photo.url} alt="" className="carousel-image" />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p>写真はまだありません</p>
                        )}
                        <p>{selectedSpot.description}</p>
                        <button
                            className="optional-toggle"
                            onClick={() => setShowAccessRules(v => !v)}
                        >
                            アクセス情報
                        </button>
                        {showAccessRules && (
                            <div className="optional-section">


                                {selectedSpot.accessTime?.days?.length ? (
                                    <div>
                                        <p>アクセス情報</p>
                                        <div className="days-list">
                                            {[0, 1, 2, 3, 4, 5, 6].map(day => (
                                                <div
                                                    key={day}
                                                    className={`date ${selectedSpot.accessTime?.days?.includes(day) ? "open" : "closed"}`}
                                                >
                                                    {["月", "火", "水", "木", "金", "土", "日"][day]}
                                                </div>
                                            ))}

                                        </div>

                                        <p>営業時間：{selectedSpot.accessTime.openTime} – {selectedSpot.accessTime.closeTime}</p>
                                        <a>{selectedSpot.accessTime.infoUrl}</a>
                                        <p>入場料：{selectedSpot.accessFees}</p>
                                    </div>
                                ) : (
                                    <p>アクセス制限なし</p>
                                )}
                            </div>
                        )}

                        <button
                            className="optional-toggle"
                            onClick={() => setShowPhotoInfo(v => !v)}
                        >
                            撮影情報
                        </button>
                        {showPhotoInfo && (
                            <div className="optional-section">
                                <p>推奨撮影条件：{selectedSpot.shootingConditions}</p>
                                <p>見頃時期：{selectedSpot.peakSeason}</p>
                                <p>三脚：{selectedSpot.tripodUsage}</p>

                                {selectedSpot.recommendedFocalLength?.length > 0 && (
                                    <div >
                                        <span >推奨焦点距離：</span>
                                        <span >
                                            {selectedSpot.recommendedFocalLength
                                                .map(idx => ["超広角", "広角", "標準", "望遠", "超望遠"][idx])
                                                .join("・")}
                                        </span>
                                    </div>
                                )}

                            </div>
                        )}
                        <div className="reviews-section">
                            <div className="reviews-header">
                                <h3>コメント</h3>
                                <button className="add-review-btn" onClick={() => setShowAddReview(true)}>+</button>
                            </div>
                            {selectedSpot?.ratingSummary?.count > 0 ? (
                                <p className="reviews-summary">
                                    {selectedSpot.ratingSummary.average?.toFixed(1)} ⭐ ( {selectedSpot.ratingSummary.count} )

                                </p>
                            ) : (

                                <p className="no-reviews">コメントなし</p>
                            )}

                            <div className="reviews-carousel">
                                {reviews?.length > 0 ? (
                                    reviews.map((review, index) => (
                                        <div key={index} className="review-card">
                                            <p className="review-rating">⭐ {review.rating}</p>
                                            <p className="review-comment">{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-reviews">No reviews yet</p>
                                )}
                            </div>

                            {showAddReview && (
                                <div className="add-review-form">
                                    <input
                                        type="number"
                                        name="rating"
                                        placeholder="Score"
                                        value={userReview.rating}
                                        onChange={handleUserReviewChange}
                                        className="input"
                                        min={1}
                                        max={5}
                                    />
                                    <textarea
                                        type="text"
                                        name="comment"
                                        placeholder="コメント"
                                        value={userReview.comment}
                                        onChange={handleUserReviewChange}
                                        className="input"
                                    />
                                    <button
                                        className="submit-btn"
                                        onClick={async () => {
                                            if (!userReview.rating || !userReview.comment) return;
                                            const createdReview = await addReview({ spotId: selectedSpot._id, ...userReview });
                                            console.log("Created review:", createdReview);
                                            setUserReview({ rating: "", comment: "" });
                                            setShowAddReview(false);
                                        }}
                                    >
                                        送信
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                    {showSeasonReports && (
                        <div className="full-overlay" onClick={() => setShowSeasonReports(false)}>
                            <div className="full-overlay-content" onClick={(e) => e.stopPropagation()}>
                                {/* Header */}
                                <div className="season-sheet-header">
                                    <h3>Season Reports</h3>
                                    <button className="close-btn" onClick={() => setShowSeasonReports(false)}>✕</button>
                                </div>

                                {/* List */}
                                <div className="season-sheet-content">
                                    {selectedSpot.seasonReports?.length === 0 && <p>No season reports yet</p>}

                                    {selectedSpot.seasonReports?.sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((report) => (
                                            <div key={report._id} className="season-report">
                                                <div className={`status ${report.status}`}>{["見頃情報なし", "序盤", "見頃前", "見頃", "後半", "見頃後"][report.status]}</div>
                                                <div>{report.date?.slice(0, 10)}</div>
                                                <p>{report.note}</p>
                                            </div>
                                        ))}
                                </div>

                                {/* Add report footer */}
                                <div className="season-sheet-footer">
                                    <select
                                        className="input"
                                        value={seasonForm.status || ""}
                                        onChange={(e) =>
                                            setSeasonForm((prev) => ({ ...prev, status: Number(e.target.value) }))
                                        }
                                    >
                                        <option value="">Season status</option>
                                        <option value={1}>序盤</option>
                                        <option value={2}>見頃前</option>
                                        <option value={3}>見頃</option>
                                        <option value={4}>後半</option>
                                        <option value={5}>見頃後</option>
                                    </select>

                                    <input
                                        type="date"
                                        className="input"
                                        value={seasonForm.date || ""}
                                        onChange={(e) =>
                                            setSeasonForm((prev) => ({ ...prev, date: e.target.value }))
                                        }
                                    />

                                    <textarea
                                        className="input"
                                        placeholder="予測 あと二日など"
                                        value={seasonForm.note}
                                        onChange={(e) =>
                                            setSeasonForm((prev) => ({ ...prev, note: e.target.value }))
                                        }
                                    />

                                    <button
                                        className="submit-btn"
                                        disabled={!seasonForm.status || !seasonForm.date}
                                        onClick={async () => {
                                            const newReport = {
                                                _id: Date.now().toString(), // temporary id for frontend
                                                year: new Date(seasonForm.date).getFullYear(),
                                                date: seasonForm.date,
                                                status: Number(seasonForm.status),
                                                note: seasonForm.note,
                                                userId: JSON.parse(localStorage.getItem("user"))?.id,
                                            };

                                            // Update spot locally
                                            setSelectedSpot((prev) => ({
                                                ...prev,
                                                seasonReports: [...prev.seasonReports, newReport],
                                            }));

                                            // Reset form
                                            setSeasonForm({ status: "", note: "", date: "" });

                                            // Persist to backend
                                            try {
                                                await addSeasonReport(selectedSpot._id, newReport);
                                            } catch (err) {
                                                console.error("Failed to save season report:", err);
                                            }
                                        }}
                                    >
                                        Add Season Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filter Bar */}
            <div className="filter-bar-wrapper">
                <button className="filter-toggle" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    ☰ メニュー
                </button>
                <div className={`filter-bar ${isFilterOpen ? 'open' : 'closed'}`}>
                    <button onClick={() => handleFilterClick("all")}>全スポット</button>
                    <button onClick={() => handleFilterClick("hanabi")}>花火</button>
                    <button onClick={() => handleFilterClick("toritetsu")}>撮り鉄</button>
                    <button onClick={() => handleFilterClick("seasonal")}>季節</button>
                    <button className="special" onClick={() => { startAdding(); setIsFilterOpen(false); }}>スポット追加</button>
                    <div className="flyto-container">
                        <input
                            placeholder="町名・都市名"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") flyToPlace(searchText);
                            }}
                        />
                        <button className="special" onClick={() => flyToPlace(searchText)}>検索</button>
                    </div>
                    <button className="special" onClick={flyToUserLocation}>現在地へ</button>
                </div>
            </div>

            {/* Add Spot Form Panel */}
            {adding && tempCoords && (
                <div className="add-spot-panel">
                    <button className="close-btn" onClick={cancelAdding}>✕</button>
                    <h2>スポット追加</h2>
                    <p className="coords-display">Lat: {tempCoords?.lat.toFixed(5)}, Lng: {tempCoords?.lng.toFixed(5)}</p>

                    <input type="text" name="name" placeholder="場所名" value={formData.name} onChange={handleChange} className="input" />
                    <textarea name="description" placeholder="説明" value={formData.description} onChange={handleChange} className="textarea" />

                    <label htmlFor="photo-upload" className="upload-label">
                        写真アップロード
                    </label>

                    <input
                        id="photo-upload" type="file" multiple accept="image/*" className="input-file"
                        onChange={(e) =>
                            setFormData(prev => ({ ...prev, photos: e.target.files }))
                        }
                    />


                    <select name="type" value={formData.type} onChange={handleChange} className="textarea">
                        <option value="" disabled>スポット種類</option>
                        <option value="hanabi">花火スポット</option>
                        <option value="toritetsu">撮り鉄スポット</option>
                        <option value="seasonal">季節スポット</option>
                    </select>

                    {formData.type && (
                        <CreatableSelect
                            isClearable
                            className="CreatableSelect"
                            styles={{
                                control: (base) => ({ ...base, color: "#353535" }),
                                singleValue: (base) => ({ ...base, color: "#353535" }),
                                option: (base) => ({ ...base, color: "#353535" }),
                            }}
                            options={(subtypeLibrary[formData.type] || []).map((st) => ({ value: st, label: st }))}
                            onChange={(selected) => setFormData(prev => ({ ...prev, subtype: selected ? selected.value : "" }))}
                            onCreateOption={async (newValue) => {
                                const newSubtype = await createSubtype(formData.type, newValue);
                                setFormData(prev => ({ ...prev, subtype: newSubtype }));
                            }}
                            value={formData.subtype ? { label: formData.subtype, value: formData.subtype } : null}
                        />
                    )}

                    <button
                        className="optional-toggle"
                        onClick={() => setShowAccessRules(v => !v)}
                    >
                        アクセス情報 (任意)
                    </button>
                    {showAccessRules && (
                        <div className="optional-section">
                            <h3>アクセス</h3>

                            {/* Closed Days */}
                            <label>営業日</label>
                            <div className="days-checkboxes">
                                {["月", "火", "水", "木", "金", "土", "日"].map((day, idx) => (
                                    <label key={idx}>
                                        <input
                                            type="checkbox"
                                            checked={formData.accessTime?.days?.includes(idx)}
                                            onChange={() => {
                                                const days = formData.accessTime?.days || [];
                                                if (days.includes(idx)) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        accessTime: { ...prev.accessTime, days: days.filter(d => d !== idx) }
                                                    }));
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        accessTime: { ...prev.accessTime, days: [...days, idx] }
                                                    }));
                                                }
                                            }}
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>

                            {/* Open / Close Time */}
                            <label>営業開始時間</label>
                            <input
                                type="time"
                                value={formData.accessTime?.openTime || ""}
                                className="input"
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        accessTime: { ...prev.accessTime, openTime: e.target.value }
                                    }))
                                }
                            />

                            <label>営業終了時間</label>
                            <input
                                type="time"
                                value={formData.accessTime?.closeTime || ""}
                                className="input"
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        accessTime: { ...prev.accessTime, closeTime: e.target.value }
                                    }))
                                }
                            />

                            {/* Info URL */}
                            <label>詳細/連絡先/公式サイトなど</label>
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={formData.accessTime?.infoUrl || ""}
                                className="input"
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        accessTime: { ...prev.accessTime, infoUrl: e.target.value }
                                    }))
                                }
                            />
                            <label>入場料</label>
                            <textarea
                                placeholder="入場料"
                                value={formData.accessFees || ""}
                                className="input"
                                onChange={(e) => setFormData(prev => ({ ...prev, accessFees: e.target.value }))}
                            />
                            <label>撮影に関する注意事項</label>
                            <textarea
                                placeholder="注意事項"
                                value={formData.accessRules || ""}
                                className="input"
                                onChange={(e) => setFormData(prev => ({ ...prev, accessRules: e.target.value }))}
                            />
                        </div>
                    )}
                    <button
                        className="optional-toggle"
                        onClick={() => setShowPhotoInfo(v => !v)}
                    >
                        撮影情報（任意）
                    </button>

                    {showPhotoInfo && (

                        <div className="optional-section">
                            <label>推奨撮影条件</label>
                            <input
                                type="text"
                                name="shootingConditions"
                                placeholder="早朝、快晴など"
                                value={formData.shootingConditions}
                                onChange={handleChange}
                                className="input"
                            />
                            <label>見頃時期</label>
                            <input
                                type="text"
                                name="peakSeason"
                                placeholder="見頃時期"
                                value={formData.peakSeason}
                                onChange={handleChange}
                                className="input"
                            />
                            <div className="segmented">
                                <label>推奨焦点距離</label>
                                {["超広角", "広角", "標準", "望遠", "超望遠"].map((option, idx) => (
                                    <button key={option} type="button" className={`choice ${formData.recommendedFocalLength?.includes(idx) ? "active" : ""}`}
                                        onClick={() => {
                                            setFormData(prev => {
                                                const current = prev.recommendedFocalLength || [];
                                                if (current.includes(idx)) {
                                                    return { ...prev, recommendedFocalLength: current.filter(f => f !== idx) };
                                                } else {
                                                    return { ...prev, recommendedFocalLength: [...current, idx] };
                                                }
                                            });
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="segmented">
                                <b>三脚: </b>
                                {["三脚必須", "三脚推奨", "手持ち撮影可"].map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`choice ${formData.tripodUsage === option ? "active" : ""}`}
                                        value={option}
                                        onClick={() => setFormData(prev => ({ ...prev, tripodUsage: option }))}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>



                        </div>
                    )}

                    <button
                        className="submit-btn"
                        onClick={async () => {
                            const createdSpot = await submitSpot();
                            if (!createdSpot) return;

                            setUploadingPhotos(true);
                            try {
                                let uploadedPhotos = [];
                                if (formData.photos?.length > 0) {
                                    uploadedPhotos = await uploadPhotos({ spotId: createdSpot._id, files: formData.photos, token });
                                }
                                console.log("ahhh", uploadedPhotos);

                                // Merge photos into createdSpot
                                const spotWithPhotos = {
                                    ...createdSpot,
                                    photos: uploadedPhotos?.map(p => ({
                                        url: p.url || `${API_BASE}/uploads/${p.filename}` // fallback
                                    })) || []
                                };
                                setSpots(prev => [...prev, spotWithPhotos]);
                                setSelectedSpot(spotWithPhotos);

                            } finally {
                                setUploadingPhotos(false);

                            }

                        }}
                    >
                        送信
                    </button>


                </div>
            )
            }
            {uploadingPhotos && (
                <div className="upload-overlay">
                    <div className="upload-popup">
                        写真をアップロード中...
                    </div>
                </div>

            )}
        </div >
    );
}