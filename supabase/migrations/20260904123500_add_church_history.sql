CREATE TABLE IF NOT EXISTS ChurchPastorate (
    id TEXT NOT NULL,
    pastorName TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Pastor Titular',
    startYear INTEGER NOT NULL,
    endYear INTEGER,
    photoUrl TEXT,
    biography TEXT NOT NULL,
    keyMilestones TEXT,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ChurchPastorate_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS ChurchPastorate_startYear_orderIndex_idx ON ChurchPastorate(startYear, orderIndex);
CREATE INDEX IF NOT EXISTS ChurchPastorate_active_idx ON ChurchPastorate(active);

CREATE TABLE IF NOT EXISTS ChurchHistoryItem (
    id TEXT NOT NULL,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    imageUrl TEXT,
    category TEXT NOT NULL,
    source TEXT,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ChurchHistoryItem_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS ChurchHistoryItem_year_category_idx ON ChurchHistoryItem(year, category);
CREATE INDEX IF NOT EXISTS ChurchHistoryItem_active_idx ON ChurchHistoryItem(active);

ALTER TABLE ChurchPastorate ENABLE ROW LEVEL SECURITY;
ALTER TABLE ChurchHistoryItem ENABLE ROW LEVEL SECURITY;
