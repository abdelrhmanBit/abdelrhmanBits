import sqlite3
from collections import deque

DB_FILE = "wassal.db"  # اسم ملف قاعدة البيانات

def get_connection():
    return sqlite3.connect(DB_FILE)

def get_all_connections():
    connection = get_connection()
    connection.row_factory = sqlite3.Row
    try:
        cursor = connection.cursor()
        sql = """
        SELECT 
            ls1.station_id AS from_station, 
            ls2.station_id AS to_station, 
            ls1.line_id,
            l.type as transport_type,
            l.name as line_name,
            (ls2.order_in_line - ls1.order_in_line) AS distance
        FROM line_stations ls1
        JOIN line_stations ls2 ON ls1.line_id = ls2.line_id AND ls2.order_in_line = ls1.order_in_line + 1
        JOIN transport_lines l ON ls1.line_id = l.id
        """
        cursor.execute(sql)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        connection.close()

def build_graph_with_lines():
    graph = {}
    connections = get_all_connections()
    
    for row in connections:
        from_station = row['from_station']
        to_station = row['to_station']
        line_id = row['line_id']
        transport_type = row['transport_type']
        line_name = row['line_name']
        
        connection_info = {
            'to_station': to_station,
            'line_id': line_id,
            'transport_type': transport_type,
            'line_name': line_name
        }
        
        graph.setdefault(from_station, []).append(connection_info)
        
        reverse_connection_info = {
            'to_station': from_station,
            'line_id': line_id,
            'transport_type': transport_type,
            'line_name': line_name
        }
        graph.setdefault(to_station, []).append(reverse_connection_info)
    
    return graph

def find_route_with_transfers(start, goal, graph):
    if start == goal:
        return None
    
    queue = deque([{
        'path': [start],
        'current_line': None,
        'transfers': 0,
        'segments': []
    }])
    visited = set()
    
    while queue:
        current = queue.popleft()
        current_station = current['path'][-1]
        
        state = (current_station, current['transfers'])
        if state in visited:
            continue
        visited.add(state)
        
        if current_station == goal:
            return {
                'path': current['path'],
                'segments': current['segments'],
                'total_transfers': current['transfers'],
                'total_stations': len(current['path'])
            }
        
        neighbors = graph.get(current_station, [])
        for neighbor in neighbors:
            next_station = neighbor['to_station']
            line_id = neighbor['line_id']
            transport_type = neighbor['transport_type']
            line_name = neighbor['line_name']
            
            if len(current['path']) > 1 and next_station == current['path'][-2]:
                continue
            
            new_path = current['path'] + [next_station]
            new_segments = current['segments'].copy()
            new_transfers = current['transfers']
            
            if current['current_line'] is not None and current['current_line'] != line_id:
                new_transfers += 1
            
            if not new_segments or new_segments[-1]['line_id'] != line_id:
                new_segments.append({
                    'start_station': current_station,
                    'end_station': next_station,
                    'line_id': line_id,
                    'transport_type': transport_type,
                    'line_name': line_name,
                    'stations': [current_station, next_station]
                })
            else:
                new_segments[-1]['end_station'] = next_station
                new_segments[-1]['stations'].append(next_station)
            
            queue.append({
                'path': new_path,
                'current_line': line_id,
                'transfers': new_transfers,
                'segments': new_segments
            })
    
    return None

def format_route_result(route_result, start_name, end_name):
    if not route_result:
        return None
    
    connection = get_connection()
    connection.row_factory = sqlite3.Row
    try:
        cursor = connection.cursor()
        station_ids = list(set([s for segment in route_result['segments'] for s in segment['stations']]))
        id_name_map = {}
        if station_ids:
            placeholders = ",".join(["?"] * len(station_ids))
            cursor.execute(f"SELECT id, name FROM stations WHERE id IN ({placeholders})", station_ids)
            id_name_map = {row['id']: row['name'] for row in cursor.fetchall()}
    finally:
        connection.close()
    
    formatted_segments = []
    for i, segment in enumerate(route_result['segments']):
        start_station_name = id_name_map.get(segment['start_station'], 'Unknown station')
        end_station_name = id_name_map.get(segment['end_station'], 'Unknown station')
        
        formatted_segment = {
            'from': start_station_name,
            'to': end_station_name,
            'transport_type': segment['transport_type'],
            'line_name': segment['line_name'],
            'stations_count': len(segment['stations']),
            'is_transfer': i > 0
        }
        formatted_segments.append(formatted_segment)
    
    return {
        'segments': formatted_segments,
        'total_transfers': route_result['total_transfers'],
        'total_stations': route_result['total_stations'],
        'start': start_name,
        'end': end_name
    }

def calculate_price(num_stations):
    if 1 <= num_stations <= 9:
        return 8
    elif 10 <= num_stations <= 16:
        return 10
    elif 17 <= num_stations <= 23:
        return 15
    else:
        return 20