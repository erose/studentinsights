class FakeServiceGenerator

  def initialize(student)
    @date = DateTime.new(2010, 9, 1)
    @student = student
    @drawn_service_type_ids = Set.new
    @all_service_type_ids = ServiceType.all.map(&:id).to_set
  end

  def next
    @date += rand(30..60)  # days
    educator = Educator.where(admin: true).first
    service_type_id = (@all_service_type_ids - @drawn_service_type_ids).to_a.sample
    @drawn_service_type_ids.add(service_type_id)

    return {
      student_id: @student.id,
      service_type_id: service_type_id,
      provided_by_educator_name: [educator.full_name, nil].sample,
      date_started: @date - rand(0..7),
      recorded_at: @date,
      recorded_by_educator_id: Educator.all.sample.id
    }
  end
end
