import React, { useState } from 'react';
import { Calendar, Search, MapPin, ChevronRight, ChevronDown, Zap, Shield, Crosshair, Bell, Train, Clock, CheckCircle2 } from 'lucide-react';
import SeatSelection from './SeatSelection';

function SmartSearch() {
  const [source, setSource] = useState('New Delhi (NDLS)');
  const [destination, setDestination] = useState('Mumbai Central (MMCT)');
  const [date, setDate] = useState('2026-03-25');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const stations = [
    'New Delhi (NDLS)',
    'Mumbai Central (MMCT)',
    'Nashik Road (NK)',
    'Pune Junction (PUNE)',
    'Howrah Junction (HWH)',
    'Chennai Central (MAS)',
    'Nagpur Junction (NGP)',
    'Ahmedabad Junction (ADI)',
    'Bangalore City (SBC)',
    'Varanasi Junction (BSB)'
  ];

  // Data will be fetched from the backend via /api/search

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    setSelectedTrain(null);
    setSelectedClass(null);

    try {
      const response = await fetch(`http://localhost:5000/api/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data);

      setTimeout(() => {
        document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Search Error:', err);
      // Fallback for demo if backend is not running or error occurs
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: 'var(--bg-color)' }}>

      {/* Hero Search Section */}
      <div className="hero-section" style={{ position: 'relative', background: `url('/train_hero_bg.png') center/cover`, padding: '4rem 3rem', display: 'flex', alignItems: 'center', minHeight: '500px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(10,25,47,0.7) 0%, rgba(10,25,47,0.2) 100%)' }}></div>

        <div className="booking-card" style={{ position: 'relative', background: 'white', padding: '2.5rem', borderRadius: '1rem', width: '100%', maxWidth: '550px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: 'var(--navy-900)', fontSize: '2rem', marginBottom: '2rem', fontWeight: '800' }}>
            Book Your <span style={{ color: 'var(--orange-500)' }}>Train Ticket</span>
          </h2>

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <datalist id="stations-list">
              {stations.map((st, index) => <option key={index} value={st} />)}
            </datalist>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ color: 'var(--navy-600)', fontWeight: '600' }}>From Station</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--orange-500)' }} />
                  <input type="text" list="stations-list" className="form-control" placeholder="Origin Station" value={source} onChange={(e) => setSource(e.target.value)} style={{ width: '100%', paddingLeft: '2.5rem' }} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ color: 'var(--navy-600)', fontWeight: '600' }}>To Station</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--navy-600)' }} />
                  <input type="text" list="stations-list" className="form-control" placeholder="Destination Station" value={destination} onChange={(e) => setDestination(e.target.value)} style={{ width: '100%', paddingLeft: '2.5rem' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" style={{ color: 'var(--navy-600)', fontWeight: '600' }}>Date of Journey</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--orange-500)' }} />
                  <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', paddingLeft: '2.5rem' }} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1.25rem', fontSize: '1.25rem', fontWeight: '700', marginTop: '1rem', borderRadius: '0.75rem' }}>
              <Search size={22} /> {loading ? 'SEARCHING...' : 'SEARCH TRAINS'}
            </button>
          </form>
        </div>
      </div>

      {/* Search Results Section */}
      {hasSearched && (
        <div id="search-results" className="animate-fade-in" style={{ padding: '3rem', backgroundColor: 'var(--bg-color)', flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: 'var(--navy-900)', fontSize: '1.75rem', fontWeight: '700' }}>Search Results</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Showing available trains for {source} to {destination} on {date}</p>
            </div>
            <div className="badge badge-confirmed" style={{ padding: '0.5rem 1rem' }}>{searchResults.length} Trains Found</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {searchResults.map((train) => (
              <div key={train.train_no} className="glass-panel" style={{ padding: '2rem', transition: 'var(--transition)', border: selectedTrain?.train_no === train.train_no ? '2px solid var(--orange-400)' : '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.5rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Train size={24} color="var(--orange-500)" />
                      {train.train_name} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({train.train_no})</span>
                    </h4>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {train.departure_time}</div>
                      <div style={{ fontWeight: '700', color: 'var(--navy-700)' }}>15h 00m</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {train.arrival_time}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {train.classes.map((cls) => (
                      <div
                        key={cls.class_id}
                        onClick={() => {
                          setSelectedTrain(train);
                          setSelectedClass(cls.class_name);
                        }}
                        style={{
                          padding: '1rem',
                          borderRadius: '0.75rem',
                          border: `2px solid ${selectedTrain?.train_no === train.train_no && selectedClass === cls.class_name ? 'var(--orange-500)' : 'var(--gray-200)'}`,
                          backgroundColor: selectedTrain?.train_no === train.train_no && selectedClass === cls.class_name ? 'var(--orange-100)' : 'white',
                          cursor: 'pointer',
                          minWidth: '130px',
                          textAlign: 'center',
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{cls.class_name}</div>
                        <div style={{ color: 'var(--orange-500)', fontWeight: '700', margin: '0.25rem 0' }}>₹{cls.base_fare}</div>
                        <div style={{ fontSize: '0.8rem', color: cls.available_seats < 5 ? '#e11d48' : '#059669', fontWeight: '600' }}>
                          {cls.available_seats < 5 ? `ONLY ${cls.available_seats} LEFT` : 'AVAILABLE'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTrain?.train_no === train.train_no && (
                  <div className="animate-fade-in" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px dashed var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h5 style={{ fontSize: '1.25rem', color: 'var(--navy-900)' }}>Select Individual Seats</h5>
                      <div style={{ fontSize: '0.85rem', color: 'white', background: 'var(--navy-600)', padding: '0.4rem 1rem', borderRadius: '0.5rem' }}>
                        Class: <strong>{selectedClass}</strong>
                      </div>
                    </div>
                    <SeatSelection trainNo={train.train_no} trainName={train.train_name} classType={selectedClass} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasSearched && (
        <div style={{ padding: '4rem 3rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--navy-600)', fontSize: '1.5rem', marginBottom: '1rem' }}>Search for trains to see live availability</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Use the form above to find the best routes for your next journey.</p>
        </div>
      )}

      {/* Features Footer Section */}
      <footer style={{ backgroundColor: 'var(--navy-900)', color: 'white', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '4px solid var(--orange-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%' }}><Zap size={20} color="var(--orange-400)" /></div>
          <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>10x Fast Booking</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%' }}><Shield size={20} color="var(--orange-400)" /></div>
          <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>Secured Payment</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%' }}><MapPin size={20} color="var(--orange-400)" /></div>
          <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>Live PNR Tracking</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '50%' }}><Bell size={20} color="var(--orange-400)" /></div>
          <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>24/7 Rail Support</span>
        </div>
      </footer>

    </div>
  );
}

export default SmartSearch;
