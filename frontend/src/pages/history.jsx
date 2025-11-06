import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import styles from '../styles/History.module.css';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [getHistoryOfUser]);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} at ${hours}:${minutes}`;
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInMinutes > 0) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };

    return (
        <div className={styles.historyContainer}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.titleSection}>
                            <div className={styles.iconContainer}>
                                <span className={styles.historyIcon}>🕒</span>
                            </div>
                            <div>
                                <h1 className={styles.title}>Meeting History</h1>
                                <p className={styles.subtitle}>Your recent video call sessions</p>
                            </div>
                        </div>
                        
                        <button
                            className={styles.backButton}
                            onClick={() => routeTo("/home")}
                        >
                            <span className={styles.icon}>🏠</span>
                            Back to Home
                        </button>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.statsSection}>
                        <div className={styles.statChip}>
                            <span className={styles.chipIcon}>📹</span>
                            {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Meeting Cards */}
                {loading ? (
                    <div className={styles.loadingGrid}>
                        {[1, 2, 3].map((item) => (
                            <div key={item} className={styles.loadingSkeleton}></div>
                        ))}
                    </div>
                ) : meetings.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>🕒</span>
                        <h2 className={styles.emptyTitle}>No meetings yet</h2>
                        <p className={styles.emptyText}>
                            Join your first meeting to see it appear here
                        </p>
                        <button
                            className={styles.ctaButton}
                            onClick={() => routeTo("/home")}
                        >
                            <span className={styles.icon}>📹</span>
                            Join a Meeting
                        </button>
                    </div>
                ) : (
                    <div className={styles.meetingsGrid}>
                        {meetings.map((meeting, index) => (
                            <div key={index} className={styles.meetingCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.meetingIcon}>📹</div>
                                    <div className={styles.meetingInfo}>
                                        <h3 className={styles.meetingTitle}>Meeting #{index + 1}</h3>
                                        <p className={styles.meetingTime}>{getTimeAgo(meeting.date)}</p>
                                    </div>
                                </div>

                                <div className={styles.cardDivider}></div>

                                <div className={styles.cardContent}>
                                    <div className={styles.codeSection}>
                                        <div className={styles.codeLabel}>
                                            <span className={styles.codeIcon}>💻</span>
                                            Meeting Code:
                                        </div>
                                        <div className={styles.codeChip}>
                                            {meeting.meetingCode}
                                        </div>
                                    </div>

                                    <div className={styles.dateSection}>
                                        <span className={styles.dateIcon}>⏰</span>
                                        <span className={styles.dateText}>
                                            {formatDate(meeting.date)}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.rejoinButton}
                                        onClick={() => routeTo(`/${meeting.meetingCode}`)}
                                    >
                                        <span className={styles.icon}>📹</span>
                                        Rejoin Meeting
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}