import React from "react";
import "./Skeleton.css";

export const PostSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-circle skeleton"></div>
        <div className="skeleton-header-info">
          <div className="skeleton-line short skeleton"></div>
          <div className="skeleton-line extra-short skeleton"></div>
        </div>
      </div>
      <div className="skeleton-image skeleton"></div>
      <div className="skeleton-actions">
        <div className="skeleton-actions-left">
          <div className="skeleton-icon skeleton"></div>
          <div className="skeleton-icon skeleton"></div>
          <div className="skeleton-icon skeleton"></div>
        </div>
        <div className="skeleton-icon skeleton"></div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line medium skeleton"></div>
        <div className="skeleton-line long skeleton"></div>
      </div>
    </div>
  );
};

export const BlogDetailsSkeleton = () => {
  return (
    <div className="skeleton-details-card">
      <div className="skeleton-details-header">
        <div className="skeleton-btn skeleton"></div>
        <div className="skeleton-author-info">
          <div className="skeleton-circle-large skeleton"></div>
          <div className="skeleton-header-info">
            <div className="skeleton-line short skeleton"></div>
            <div className="skeleton-line extra-short skeleton"></div>
          </div>
        </div>
        <div className="skeleton-line extra-short skeleton"></div>
      </div>
      <div className="skeleton-line title skeleton"></div>
      <div className="skeleton-details-image skeleton"></div>
      <div className="skeleton-details-desc">
        <div className="skeleton-line long skeleton"></div>
        <div className="skeleton-line long skeleton"></div>
        <div className="skeleton-line medium skeleton"></div>
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="skeleton-profile-container">
      <div className="skeleton-profile-header">
        <div className="skeleton-circle-profile skeleton"></div>
        <div className="skeleton-profile-info">
          <div className="skeleton-line title skeleton"></div>
          <div className="skeleton-line medium skeleton"></div>
          <div className="skeleton-line long skeleton"></div>
        </div>
      </div>
      <div className="skeleton-profile-tabs">
        <div className="skeleton-tab skeleton"></div>
        <div className="skeleton-tab skeleton"></div>
        <div className="skeleton-tab skeleton"></div>
      </div>
      <div className="skeleton-profile-grid">
        <div className="skeleton-grid-item skeleton"></div>
        <div className="skeleton-grid-item skeleton"></div>
        <div className="skeleton-grid-item skeleton"></div>
        <div className="skeleton-grid-item skeleton"></div>
        <div className="skeleton-grid-item skeleton"></div>
        <div className="skeleton-grid-item skeleton"></div>
      </div>
    </div>
  );
};
