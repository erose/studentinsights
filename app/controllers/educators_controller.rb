class EducatorsController < ApplicationController

  # Authentication by default inherited from ApplicationController.

  def homepage
    redirect_to homepage_path_for_role(current_educator)
  end

  def names_for_dropdown
    student = Student.find(params[:id])
    school = student.school

    if school.nil?
      render json: [] and return
    end

    render json: filtered_names(params[:term], school)
  end

  def reset_session_clock
    # Send arbitrary request to reset Devise Timeoutable

    respond_to do |format|
      format.json { render json: :ok }
    end
  end

  private

  def filtered_names(term, school)
    unfiltered = (school.educator_names_for_services + Service.provider_names).uniq.compact

    return unfiltered.sort_by(&:downcase) if term.nil?  # Handle missing param

    filtered = unfiltered.select do |name|
      split_name = name.split(', ')   # SIS name format expected
      split_name.any? { |name_part| match?(term, name_part) } || match?(term, name)
    end

    return filtered.sort_by(&:downcase)
  end

  def match?(term, string_to_test)
    term.downcase == string_to_test.slice(0, term.length).downcase
  end

end
